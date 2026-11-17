// Builds src/components/portraitData.js: a lit stipple point cloud of a scanned male head wearing wayfarer sunglasses.
// Source mesh: "Infinite, 3D Head Scan" by Lee Perry-Smith (CC BY 3.0), via the three.js examples:
// https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/LeePerrySmith
// Usage: node scripts/build-portrait.mjs path/to/LeePerrySmith.glb
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('Usage: node scripts/build-portrait.mjs path/to/LeePerrySmith.glb'); process.exit(1); }

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const gauss = (v, m, sd) => Math.exp(-((v - m) ** 2) / (2 * sd * sd));
const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const norm = (v) => { const n = Math.hypot(...v); return v.map((c) => c / n); };

/* ---- read the GLB ---- */
const glb = readFileSync(src);
const jsonLen = glb.readUInt32LE(12), gltf = JSON.parse(glb.subarray(20, 20 + jsonLen));
const bin = glb.subarray(20 + jsonLen + 8);
const read = (index, Type, size) => {
  const a = gltf.accessors[index], view = gltf.bufferViews[a.bufferView], at = bin.byteOffset + (view.byteOffset || 0) + (a.byteOffset || 0);
  return new Type(bin.buffer.slice(at, at + a.count * size * Type.BYTES_PER_ELEMENT));
};
const prim = gltf.meshes[0].primitives[0];
const IDX = read(prim.indices, Uint16Array, 1), POS = read(prim.attributes.POSITION, Float32Array, 3), NRM = read(prim.attributes.NORMAL, Float32Array, 3);

/* ---- normalise: x right, y down, z toward viewer; eye line at v = -0.055, head centre at z = 0 ---- */
let tipX = 0, tipZ = -Infinity;
for (let i = 0; i < POS.length; i += 3) if (POS[i + 2] > tipZ) { tipZ = POS[i + 2]; tipX = POS[i]; }
const S = 4.1, EYE_Y = 1.9;
const toU = (x) => (x - tipX) / S, toV = (y) => -(y - EYE_Y) / S - 0.055, toZ = (z) => z / S;

/* ---- area-weighted surface samples with interpolated normals ---- */
const tris = [];
let area = 0;
for (let t = 0; t < IDX.length; t += 3) {
  const [a, b, c] = [IDX[t] * 3, IDX[t + 1] * 3, IDX[t + 2] * 3];
  const e1 = [POS[b] - POS[a], POS[b + 1] - POS[a + 1], POS[b + 2] - POS[a + 2]], e2 = [POS[c] - POS[a], POS[c + 1] - POS[a + 1], POS[c + 2] - POS[a + 2]];
  area += Math.hypot(e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]) / 2;
  tris.push([a, b, c, area]);
}
function sample(triangles = tris, totalArea = area) {
  const target = rnd() * totalArea;
  let lo = 0, hi = triangles.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (triangles[mid][3] < target) lo = mid + 1; else hi = mid; }
  const [a, b, c] = triangles[lo];
  let r1 = rnd(), r2 = rnd(); if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
  const w = [1 - r1 - r2, r1, r2], p = [0, 0, 0], n = [0, 0, 0];
  [a, b, c].forEach((k, i) => { for (let d = 0; d < 3; d++) { p[d] += POS[k + d] * w[i]; n[d] += NRM[k + d] * w[i]; } });
  const nn = norm(n);
  return { u: toU(p[0]), v: toV(p[1]), z: toZ(p[2]), nx: nn[0], ny: -nn[1], nz: nn[2] };
}

/* ---- front depth grid (used for occlusion, the lens fit and the runtime scan line) ---- */
const GRID = { u0: -0.62, u1: 0.62, v0: -0.62, v1: 1.15, cols: 72, rows: 104 };
const depth = new Float32Array(GRID.cols * GRID.rows).fill(-1);
const cell = (u, v) => {
  const c = Math.floor((u - GRID.u0) / (GRID.u1 - GRID.u0) * GRID.cols), r = Math.floor((v - GRID.v0) / (GRID.v1 - GRID.v0) * GRID.rows);
  return c < 0 || r < 0 || c >= GRID.cols || r >= GRID.rows ? -1 : r * GRID.cols + c;
};
const samples = [];
for (let k = 0; k < 260000; k++) {
  const s = sample();
  if (s.nz < -0.25) continue; // the back of the head never faces the camera within the allowed head turn
  samples.push(s);
  const c = cell(s.u, s.v);
  if (c >= 0 && s.z > depth[c]) depth[c] = s.z;
}
const depthAt = (u, v) => { const c = cell(u, v); return c >= 0 ? depth[c] : -1; };

/* ---- wayfarer sunglasses fitted to the face ---- */
const LENS = { x: 0.152, y: -0.05, a: 0.122, top: 0.056, bottom: 0.074 };
const lensR = (u, v) => { const du = (Math.abs(u) - LENS.x) / LENS.a, dv = (v - LENS.y) / (v < LENS.y ? LENS.top : LENS.bottom); return Math.sqrt(Math.sqrt(du ** 4 + dv ** 4)); };
{ // fit z = z0 - k·u² so the lenses clear the brow, cheekbones and nose bridge
  let best = null;
  for (let k = 0.6; k <= 3; k += 0.05) {
    let z0 = -Infinity;
    for (let u = -0.3; u <= 0.3; u += 0.01) for (let v = LENS.y - LENS.top * 1.2; v <= LENS.y + LENS.bottom * 1.2; v += 0.01) {
      const d = depthAt(u, v); if (d > -1) z0 = Math.max(z0, d + k * u * u + 0.03);
    }
    if (!best || z0 < best.z0) best = { z0, k };
  }
  LENS.z0 = +best.z0.toFixed(4); LENS.k = +best.k.toFixed(3);
}
const lensZ = (u) => LENS.z0 - LENS.k * u * u;

/* ---- pools ---- */
const pools = {};
const push = (name, u, v, z) => (pools[name] ||= []).push(u, v, z);
const LIGHT = norm([-0.62, -0.45, 0.64]), HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);
const lipSeam = (u) => 0.312 + 0.012 * (u / 0.115) ** 2;
const mouthMask = (u, v) => gauss(u, 0, 0.085) * gauss(v, lipSeam(u), 0.03);
const nostrilMask = (u, v) => gauss(Math.abs(u), 0.044, 0.016) * gauss(v, 0.188, 0.012);
for (const s of samples) {
  const { u, v, z, nx, ny, nz } = s;
  if (depthAt(u, v) - z > 0.05) continue; // hidden behind a nearer surface (inner ear, under the jaw)
  if (lensR(u, v) < 1.06) continue; // skin behind the dark lenses
  const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
  const spec = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]) ** 30;
  let l = 0.04 + 0.9 * diffuse ** 1.3 + 0.45 * spec;
  l *= 1 - 0.5 * gauss(u, 0, 0.17) * gauss(v, LENS.y + LENS.bottom + 0.035, 0.022); // cast shadow of the glasses
  l *= 1 - 0.9 * gauss(u, 0, 0.095) * gauss(v, lipSeam(u), 0.006);
  l *= 1 - 0.88 * nostrilMask(u, v);
  // Curvature from the depth grid: ridges (nose, lips, chin, brow) brighten, creases and cavities darken.
  const ring = [[0.03, 0], [-0.03, 0], [0, 0.03], [0, -0.03]].map(([du, dv]) => depthAt(u + du, v + dv)).filter((d) => d > -1);
  if (ring.length === 4 && Math.abs(nz) > 0.4) l *= clamp(1 + 14 * (z - ring.reduce((a, b) => a + b) / 4), 0.25, 1.7);
  if (v > 0.85) { if (rnd() < 0.12 * (0.3 + l)) push('body', u, v, z); continue; }
  if (nx > 0.84 && nz < 0.5 && u > 0 && v < 0.62 && rnd() < smooth(0.84, 0.97, nx)) push('rim', u, v, z + 0.004);
  if ((1 - Math.abs(nz)) ** 3 > 0.35 && rnd() < 0.3) push('edge', u, v, z + 0.002);
  const focus = v > 0.62 ? 0.45 * (1 - smooth(0.62, 0.8, v)) : v < -0.2 ? 0.45 : 1; // spend particles on the face
  if (rnd() > (0.6 * l ** 1.9 + 0.02) * focus) continue;
  push(l > 0.55 ? 'bright' : l > 0.28 ? 'mid' : 'shadow', u, v, z);
}
for (let k = 0; k < 30000; k++) { // designer stubble on jaw, chin and upper lip
  const u = (rnd() * 2 - 1) * 0.36, v = 0.15 + rnd() * 0.42, d = depthAt(u, v);
  const mask = smooth(0.15, 0.28, v) * (1 - smooth(0.25, 0.36, Math.abs(u))) * (1 - mouthMask(u, v));
  if (d > -1 && rnd() < mask * 0.12) push('stubble', u, v, d + 0.004);
}

// Sample the original lip surface densely; reserve its dark seam rather than drawing a synthetic outline.
function surfaceRegion(u0, u1, v0, v1) {
  const triangles = [];
  let total = 0;
  for (let t = 0; t < tris.length; t++) {
    const tri = tris[t], vertices = tri.slice(0, 3);
    const us = vertices.map((i) => toU(POS[i])), vs = vertices.map((i) => toV(POS[i + 1]));
    if (Math.min(...us) > u1 || Math.max(...us) < u0 || Math.min(...vs) > v1 || Math.max(...vs) < v0) continue;
    total += tri[3] - (t ? tris[t - 1][3] : 0);
    triangles.push([...vertices, total]);
  }
  if (!triangles.length || total <= 0) throw new Error(`Scan has no surface in region ${[u0, u1, v0, v1]}.`);
  return [triangles, total];
}
const [mouthTris, mouthArea] = surfaceRegion(-0.15, 0.15, 0.24, 0.39);
for (let k = 0; k < 12000; k++) {
  const { u, v, z, nx, ny, nz } = sample(mouthTris, mouthArea);
  if (z < 0.4 || nz < 0.2 || Math.abs(v - lipSeam(u)) < 0.007 || rnd() > mouthMask(u, v)) continue;
  const light = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
  push(light > 0.55 && v > lipSeam(u) ? 'lipHighlight' : 'lips', u, v, z + 0.002);
}

const [noseTris, noseArea] = surfaceRegion(-0.11, 0.11, -0.06, 0.23);
for (let k = 0; k < 12000; k++) {
  const { u, v, z, nx, ny, nz } = sample(noseTris, noseArea);
  if (z < 0.47 || nz < 0.15 || rnd() < nostrilMask(u, v)) continue;
  const bridge = gauss(u, -0.012, 0.019) * gauss(v, 0.045, 0.07);
  const tip = gauss(u, -0.008, 0.032) * gauss(v, 0.14, 0.026);
  const wing = gauss(Math.abs(u), 0.065, 0.02) * gauss(v, 0.16, 0.028);
  const light = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
  if (rnd() > Math.max(bridge, tip, wing) * (0.25 + 0.75 * light)) continue;
  push(Math.max(bridge, tip) > 0.35 && light > 0.5 ? 'noseHighlight' : 'nose', u, v, z + 0.002);
}

// Resample a parametric curve by arc length so lines keep an even density.
function curve(name, fn, count, zOf) {
  const pts = [], acc = [0];
  for (let k = 0; k <= 200; k++) pts.push(fn(k / 200));
  for (let k = 1; k <= 200; k++) acc.push(acc[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  for (let c = 0, k = 1; c < count; c++) {
    const d = acc[200] * (count > 1 ? c / (count - 1) : 0.5);
    while (k < 200 && acc[k] < d) k++;
    const f = (d - acc[k - 1]) / ((acc[k] - acc[k - 1]) || 1), u = pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f, v = pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f;
    push(name, u, v, zOf(u, v));
  }
}
const onLens = (u) => lensZ(u) + 0.006;
const lensEdge = (sx, grow) => (s) => {
  const a = s * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
  return [sx * LENS.x + LENS.a * grow * Math.sign(c) * Math.abs(c) ** 0.5, LENS.y + (sn < 0 ? LENS.top : LENS.bottom) * grow * Math.sign(sn) * Math.abs(sn) ** 0.5];
};
for (const sx of [-1, 1]) {
  for (const grow of [1, 1.035, 1.07]) curve('frame', lensEdge(sx, grow), 70, onLens);
  for (const grow of [1.11, 1.15]) curve('frame', (s) => lensEdge(sx, grow)(0.52 + s * 0.46), 34, onLens);
  curve('frameHi', (s) => lensEdge(sx, 1.19)(0.52 + s * 0.46), 40, onLens);
  // Temple arm: from the outer hinge back along the side of the head.
  const ox = LENS.x + LENS.a * 1.12, oy = LENS.y - LENS.top * 0.5;
  let side = ox; while (depthAt(side + 0.01, oy) > lensZ(ox) - 0.25 && side < 0.5) side += 0.005;
  const sideZ = depthAt(side, oy) + 0.02;
  curve('frame', (s) => [sx * (ox + (side - ox) * s), oy + 0.01 * s], 16, (u) => lensZ(ox) - (lensZ(ox) - sideZ) * smooth(ox, side, Math.abs(u)));
  for (let k = 0; k < 1400; k++) { // gradient tint: clear on top, smoky toward the bottom
    const u = sx * LENS.x + (rnd() * 2 - 1) * LENS.a, v = LENS.y - LENS.top + rnd() * (LENS.top + LENS.bottom);
    if (lensR(u, v) < 0.9 && rnd() < smooth(LENS.y - 0.01, LENS.y + LENS.bottom, v) ** 1.6 * 0.6) push('lensFill', u, v, lensZ(u) + 0.003);
  }
  for (const off of [-0.045, -0.02]) { // two static diagonal reflections
    for (let t = -0.16; t <= 0.16; t += 0.004) {
      const u = sx * LENS.x + off * 0.866 + t * 0.5, v = LENS.y + off * 0.5 - t * 0.866;
      if (lensR(u, v) < 0.86) push('streak', u, v, lensZ(u) + 0.008);
    }
  }
}
for (const dy of [-0.04, -0.028, -0.016]) curve('frame', (s) => [(LENS.x - LENS.a * 0.95) * (s * 2 - 1), LENS.y + dy + 0.007 * Math.sin(Math.PI * s)], 10, onLens);

/* ---- shuffle stipple pools, quantise and emit ---- */
const LIMIT = { bright: 3600, mid: 2400, shadow: 700, stubble: 900, body: 900, rim: 450, edge: 1300, lensFill: 400, lips: 1000, lipHighlight: 600, nose: 900, noseHighlight: 700 };
for (const name of Object.keys(LIMIT)) {
  const a = pools[name];
  for (let i = a.length / 3 - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); for (let c = 0; c < 3; c++) [a[i * 3 + c], a[j * 3 + c]] = [a[j * 3 + c], a[i * 3 + c]]; }
  pools[name] = a.slice(0, LIMIT[name] * 3);
}
const Q = 16000;
const encode = (arr) => Buffer.from(Int16Array.from(arr, (c) => clamp(Math.round(c * Q), -32767, 32767)).buffer).toString('base64');
const grid = Int8Array.from(depth, (d) => (d < -0.5 ? -128 : clamp(Math.round(d * 120), -127, 127)));
let top = Infinity; for (const s of samples) if (s.v < top) top = s.v;

const lines = [
  '// Generated by scripts/build-portrait.mjs — do not edit by hand.',
  '// Head geometry: "Infinite, 3D Head Scan" by Lee Perry-Smith, licensed CC BY 3.0 (based on a work at www.triplegangers.com).',
  `export const PORTRAIT_Q = ${Q};`,
  `export const PORTRAIT_TOP = ${top.toFixed(4)};`,
  `export const PORTRAIT_LENS = ${JSON.stringify(LENS)};`,
  `export const PORTRAIT_GRID = ${JSON.stringify({ ...GRID, scale: 120, data: Buffer.from(grid.buffer).toString('base64') })};`,
  'export const PORTRAIT_POOLS = {',
  ...Object.entries(pools).map(([name, a]) => `  ${name}: '${encode(a)}',`),
  '};',
  '',
];
writeFileSync(new URL('../src/components/portraitData.js', import.meta.url), lines.join('\n'));
console.log('lens', LENS, 'top', top.toFixed(3));
console.log(Object.fromEntries(Object.entries(pools).map(([k, a]) => [k, a.length / 3])));

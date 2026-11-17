// Runtime access to the generated portrait (scanned male head + wayfarer sunglasses), see scripts/build-portrait.mjs.
// Units are normalised: x right, y down, z toward the viewer; the eye line sits at y ≈ -0.05 and the chin near y ≈ 0.56.
import { PORTRAIT_GRID as GRID, PORTRAIT_LENS, PORTRAIT_POOLS, PORTRAIT_Q, PORTRAIT_TOP } from './portraitData.js';

export const LENS = PORTRAIT_LENS;
export const TOP = PORTRAIT_TOP;

/** Superellipse radius of the nearest lens: < 1 inside, 1 on the rim. */
export function lensR(u, v) {
  const du = (Math.abs(u) - LENS.x) / LENS.a, dv = (v - LENS.y) / (v < LENS.y ? LENS.top : LENS.bottom);
  return Math.sqrt(Math.sqrt(du ** 4 + dv ** 4));
}
export const lensZ = (u) => LENS.z0 - LENS.k * u * u;

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
let depth = null, rowSpan = null;
function decodeGrid() {
  depth = new Int8Array(bytes(GRID.data).buffer);
  rowSpan = new Float32Array(GRID.rows * 2);
  const cw = (GRID.u1 - GRID.u0) / GRID.cols;
  for (let r = 0; r < GRID.rows; r++) {
    let lo = -1, hi = -1;
    for (let c = 0; c < GRID.cols; c++) if (depth[r * GRID.cols + c] !== -128) { if (lo < 0) lo = c; hi = c; }
    rowSpan[r * 2] = lo < 0 ? 0 : GRID.u0 + (lo + 0.5) * cw; rowSpan[r * 2 + 1] = hi < 0 ? 0 : GRID.u0 + (hi + 0.5) * cw;
  }
}
const rowOf = (v) => Math.floor((v - GRID.v0) / (GRID.v1 - GRID.v0) * GRID.rows);
/** Left/right extent of the head at height v (both 0 outside the scan). */
export function spanAt(v) {
  const r = rowOf(v);
  return r < 0 || r >= GRID.rows ? [0, 0] : [rowSpan[r * 2], rowSpan[r * 2 + 1]];
}
/** Front-most surface depth at (u, v), or 0 where the scan is empty. */
export function depthAt(u, v) {
  const r = rowOf(v), c = Math.floor((u - GRID.u0) / (GRID.u1 - GRID.u0) * GRID.cols);
  if (r < 0 || c < 0 || r >= GRID.rows || c >= GRID.cols) return 0;
  const d = depth[r * GRID.cols + c];
  return d === -128 ? 0 : d / GRID.scale;
}

/** Particle budget per brightness bucket (0 dim → 3 lime). Names refer to generated pools or dynamic roles. */
export const FACE_PLAN = [
  [['shadow', 0.32], ['stubble', 0.25], ['lensFill', 0.13], ['body', 0.3]],
  [['mid', 0.4], ['nose', 0.12], ['lips', 0.14], ['edge', 0.34]],
  [['frame', 0.24], ['noseHighlight', 0.16], ['lipHighlight', 0.12], ['bright', 0.48]],
  [['rim', 0.26], ['streak', 0.12], ['frameHi', 0.12], ['glint', 0.16], ['scan', 0.34]],
];

/** Decode every static pool to Float32Array [u, v, z, …]. */
export function buildPortrait() {
  if (!depth) decodeGrid();
  const pools = {};
  for (const [name, b64] of Object.entries(PORTRAIT_POOLS)) pools[name] = Float32Array.from(new Int16Array(bytes(b64).buffer), (q) => q / PORTRAIT_Q);
  return pools;
}

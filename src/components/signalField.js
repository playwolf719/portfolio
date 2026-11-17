// Particle shapes and physics ported from the selected e-signal.html reference.
export function createSignalField(cv) {


    const ctx = cv.getContext('2d', { alpha: true });
    if (!ctx) return { init() {}, setShape() {}, setReduced() {}, destroy() {} };
    const listeners = new AbortController();
    let disposed = false, rt = 0;
    const listen = (target, event, handler, options = {}) => target.addEventListener(event, handler, { ...options, signal: listeners.signal });
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TAU = Math.PI * 2;
    // tweakable parameters
    const P = { spring: 0.022, damping: 0.86, pointerR: 140, pointerF: 5.5, stagger: 900, lime: 0.16 };
    let W = 0, H = 0, dpr = 1, N = 0, mobile = false;
    let x, y, vx, vy, tx, ty, s1, s2, kind, delay;
    let buckets = [[], [], [], []];
    let shape = 'monogram', shapeAt = 0, alpha = 1, alphaTarget = 1;
    let mono = new Float32Array(0), monoCount = 0;
    let nodes = [], edges = [];
    let raf = 0, running = false, last = 0, frozenT = 0;
    const ptr = { x: -9999, y: -9999, on: false };
    const bursts = [];

    const fract = (v) => v - Math.floor(v);
    const hash = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
    function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

    function countFor(w) {
      let n = w < 600 ? 800 : w < 1100 ? 1500 : 2200;
      if ((navigator.hardwareConcurrency || 8) <= 4) n = Math.round(n * 0.75);
      return n;
    }

    function alloc(n) {
      N = n;
      x = new Float32Array(n); y = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
      tx = new Float32Array(n); ty = new Float32Array(n); s1 = new Float32Array(n); s2 = new Float32Array(n);
      kind = new Uint8Array(n); delay = new Float32Array(n);
      buckets = [[], [], [], []];
      for (let i = 0; i < n; i++) {
        s1[i] = hash(i + 1); s2[i] = hash(i * 3.7 + 9);
        const h = hash(i * 7.3 + 2);
        kind[i] = h < P.lime ? 3 : h < 0.42 ? 2 : h < 0.72 ? 1 : 0;
        buckets[kind[i]].push(i);
        x[i] = Math.random() * W; y[i] = Math.random() * H;
        delay[i] = s2[i] * P.stagger;
      }
    }

    /** Sample the "B/D" monogram from rasterised text into normalised points. */
    function sampleMonogram() {
      const c = document.createElement('canvas');
      const cw = 720, ch = 320;
      c.width = cw; c.height = ch;
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '700 260px "Space Grotesk", "Helvetica Neue", Arial, sans-serif';
      g.fillText('B/D', cw / 2, ch / 2 + 8);
      const img = g.getImageData(0, 0, cw, ch).data;
      const pts = [];
      let minX = cw, maxX = 0, minY = ch, maxY = 0;
      for (let yy = 0; yy < ch; yy += 3) for (let xx = 0; xx < cw; xx += 3) {
        if (img[(yy * cw + xx) * 4 + 3] > 140) {
          pts.push(xx, yy);
          if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (yy < minY) minY = yy; if (yy > maxY) maxY = yy;
        }
      }
      const bw = Math.max(1, maxX - minX), cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      monoCount = pts.length / 2;
      mono = new Float32Array(pts.length);
      for (let i = 0; i < pts.length; i += 2) { mono[i] = (pts[i] - cx) / bw; mono[i + 1] = (pts[i + 1] - cy) / bw; }
    }

    function buildNetwork() {
      const r = rng(7);
      const n = mobile ? 12 : 20;
      nodes = [];
      for (let i = 0; i < n; i++) nodes.push({ x: W * (0.06 + 0.88 * r()), y: H * (0.14 + 0.78 * r()) });
      edges = [];
      const seen = new Set();
      nodes.forEach((a, i) => {
        const near = nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2]).filter((d) => d[0] !== i).sort((p, q) => p[1] - q[1]).slice(0, 2);
        near.forEach(([j]) => { const k = i < j ? i + '-' + j : j + '-' + i; if (!seen.has(k)) { seen.add(k); edges.push([i, j]); } });
      });
    }

    /* ---- target shapes (viewport space). t = seconds ---- */
    const SHAPES = {
      monogram(t) {
        const cx = mobile ? W * 0.5 : W * 0.7, cy = mobile ? H * 0.3 : H * 0.42;
        const sc = mobile ? W * 0.84 : Math.min(W * 0.46, H * 1.15);
        for (let i = 0; i < N; i++) {
          if (s1[i] < 0.1 || !monoCount) { // orbiting halo
            const a = s2[i] * TAU + t * 0.12 * (kind[i] === 3 ? 2 : 1), rr = sc * (0.56 + s1[i] * 0.5);
            tx[i] = cx + Math.cos(a) * rr; ty[i] = cy + Math.sin(a) * rr * 0.42;
          } else {
            const k = ((i * 7919) % monoCount) * 2;
            tx[i] = cx + mono[k] * sc + Math.sin(t * 1.3 + s2[i] * 30) * 1.2;
            ty[i] = cy + mono[k + 1] * sc + Math.cos(t * 1.1 + s1[i] * 30) * 1.2;
          }
        }
      },
      network(t) {
        const ne = edges.length, nn = nodes.length;
        for (let i = 0; i < N; i++) {
          if (s1[i] < 0.3) {
            const nd = nodes[i % nn], a = s2[i] * TAU + t * 0.4, rr = 3 + s1[i] * 26;
            tx[i] = nd.x + Math.cos(a) * rr; ty[i] = nd.y + Math.sin(a) * rr;
          } else {
            const e = edges[i % ne], A = nodes[e[0]], B = nodes[e[1]];
            const sp = kind[i] === 3 ? 0.22 : 0.03;
            const u = fract(s2[i] + t * sp * (i % 2 ? 1 : -1));
            const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1, off = (s1[i] - 0.65) * 6;
            tx[i] = A.x + dx * u - (dy / len) * off; ty[i] = A.y + dy * u + (dx / len) * off;
          }
        }
      },
      frames(t) {
        const cols = mobile ? 2 : 4, rows = mobile ? 4 : 3, F = cols * rows;
        const x0 = W * 0.06, y0 = H * 0.18, gw = W * 0.88, gh = H * 0.72, gap = mobile ? 10 : 18;
        const cw = (gw - gap * (cols - 1)) / cols, chh = (gh - gap * (rows - 1)) / rows;
        const fw = Math.min(cw, chh * 16 / 9), fh = fw * 9 / 16;
        for (let i = 0; i < N; i++) {
          const f = i % F, c = f % cols, r = (f / cols) | 0;
          const fx = x0 + c * (cw + gap) + (cw - fw) / 2, fy = y0 + r * (chh + gap) + (chh - fh) / 2;
          if (s1[i] < 0.78) {
            const per = 2 * (fw + fh), d = fract(s2[i] + t * 0.015) * per;
            if (d < fw) { tx[i] = fx + d; ty[i] = fy; }
            else if (d < fw + fh) { tx[i] = fx + fw; ty[i] = fy + d - fw; }
            else if (d < 2 * fw + fh) { tx[i] = fx + fw - (d - fw - fh); ty[i] = fy + fh; }
            else { tx[i] = fx; ty[i] = fy + fh - (d - 2 * fw - fh); }
          } else { // scan line sweeping through each frame
            tx[i] = fx + s2[i] * fw; ty[i] = fy + fract(t * 0.18 + f * 0.137) * fh;
          }
        }
      },
      strata(t) {
        const L = mobile ? 7 : 9;
        for (let i = 0; i < N; i++) {
          const lane = i % L, sp = 0.01 + (lane % 3) * 0.006;
          const px = fract(s1[i] + t * sp * (lane % 2 ? 1 : -1)) * (W + 60) - 30;
          tx[i] = px;
          ty[i] = H * (0.16 + 0.7 * lane / (L - 1)) + Math.sin(px * 0.005 + lane * 1.3 + t * 0.35) * (10 + (lane % 3) * 8) + (s2[i] - 0.5) * (6 + lane * 1.6);
        }
      },
      river(t) {
        const S = 5, amp = mobile ? W * 0.26 : W * 0.2, base = mobile ? W * 0.5 : W * 0.62;
        for (let i = 0; i < N; i++) {
          const strand = i % S, v = fract(s1[i] + t * (0.035 + strand * 0.004));
          const yy = v * (H + 80) - 40;
          const swell = 1 + Math.sin(v * 9 + t) * 0.5;
          tx[i] = base + Math.sin(v * 4.2 + t * 0.45) * amp + Math.sin(v * 11 - t * 0.3) * W * 0.03 + (strand - 2) * 12 + (s2[i] - 0.5) * 26 * swell;
          ty[i] = yy;
        }
      },
      dual(t) {
        const r = mobile ? W * 0.27 : Math.min(W, H) * 0.19;
        const c = mobile ? [[W * 0.5, H * 0.3], [W * 0.5, H * 0.72]] : [[W * 0.3, H * 0.56], [W * 0.7, H * 0.56]];
        for (let i = 0; i < N; i++) {
          const k = i % 2, dir = k ? 1 : -1;
          const inner = kind[i] === 3;
          const a = s2[i] * TAU + t * (inner ? 0.6 : 0.18) * dir;
          const rr = inner ? r * (0.38 + s1[i] * 0.08) : r * (0.9 + (s1[i] - 0.5) * 0.16);
          tx[i] = c[k][0] + Math.cos(a) * rr; ty[i] = c[k][1] + Math.sin(a) * rr;
        }
      },
      ring(t) {
        const cx = W * 0.5, cy = H * 0.5, R = Math.min(W, H) * (mobile ? 0.4 : 0.36) * (1 + 0.04 * Math.sin(t * 2.2));
        for (let i = 0; i < N; i++) {
          if (s1[i] < 0.14) { // converge to a pulsing core
            const a = s2[i] * TAU + t, rr = R * 0.05 * s1[i] / 0.14 * (1 + 0.6 * Math.sin(t * 2.2));
            tx[i] = cx + Math.cos(a) * rr; ty[i] = cy + Math.sin(a) * rr;
          } else {
            const a = s2[i] * TAU + t * 0.08, rr = R * (1 + (s1[i] - 0.57) * 0.09);
            tx[i] = cx + Math.cos(a) * rr; ty[i] = cy + Math.sin(a) * rr;
          }
        }
      }
    };

    function resize(force) {
      const nw = window.innerWidth, nh = window.innerHeight;
      if (!force && nw === W && Math.abs(nh - H) < 120) return;
      W = nw; H = nh; mobile = W < 860;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = countFor(W);
      if (n !== N) alloc(n);
      buildNetwork();
      if (reduced) snap();
    }

    function snap() {
      SHAPES[shape](frozenT);
      for (let i = 0; i < N; i++) { x[i] = tx[i]; y[i] = ty[i]; vx[i] = vy[i] = 0; }
      alpha = alphaTarget;
      draw();
    }

    function step(now) {
      const t = now / 1000;
      SHAPES[shape](t);
      const since = now - shapeAt;
      const R = P.pointerR, R2 = R * R;
      for (let i = 0; i < N; i++) {
        const k = since > delay[i] ? P.spring * (0.55 + s1[i] * 0.9) : 0.0012;
        let ax = (tx[i] - x[i]) * k, ay = (ty[i] - y[i]) * k;
        if (ptr.on) {
          const dx = x[i] - ptr.x, dy = y[i] - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / R) * (1 - d / R) * P.pointerF;
            ax += (dx / d) * f - (dy / d) * f * 0.35; ay += (dy / d) * f + (dx / d) * f * 0.35;
          }
        }
        for (let b = 0; b < bursts.length; b++) {
          const B = bursts[b], age = (now - B.t) / 1000, ring = age * 900;
          const dx = x[i] - B.x, dy = y[i] - B.y, d = Math.hypot(dx, dy) || 1;
          if (Math.abs(d - ring) < 40) { const f = (1 - age / 0.7) * 3; ax += (dx / d) * f; ay += (dy / d) * f; }
        }
        vx[i] = (vx[i] + ax) * P.damping; vy[i] = (vy[i] + ay) * P.damping;
        x[i] += vx[i]; y[i] += vy[i];
      }
      for (let b = bursts.length - 1; b >= 0; b--) if (now - bursts[b].t > 700) bursts.splice(b, 1);
      alpha += (alphaTarget - alpha) * 0.05;
    }

    const STYLES = ['rgba(125,131,142,0.42)', 'rgba(167,173,184,0.6)', 'rgba(237,239,243,0.78)', '#C6FF3D'];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = alpha;
      if (shape === 'network') {
        ctx.strokeStyle = 'rgba(167,173,184,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const [a, b] of edges) { ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); }
        ctx.stroke();
      }
      for (let b = 0; b < 4; b++) {
        const list = buckets[b], sz = b === 3 ? 2 : b === 2 ? 1.5 : 1.3;
        ctx.fillStyle = STYLES[b];
        for (let j = 0; j < list.length; j++) { const i = list[j]; ctx.fillRect(x[i] - sz / 2, y[i] - sz / 2, sz, sz); }
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - last > 250) shapeAt += now - last; // resume after long pause without jump
      last = now;
      step(now);
      draw();
    }
    function start() { if (running || reduced || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    function setShape(name, dim) {
      alphaTarget = dim ? 0.55 : 1;
      if (!SHAPES[name] || name === shape) { if (reduced) snap(); return; }
      shape = name; shapeAt = performance.now();
      for (let i = 0; i < N; i++) delay[i] = s2[i] * P.stagger * 0.6;
      if (reduced) snap();
    }

    function init() {
      sampleMonogram();
      resize(true);
      shapeAt = performance.now();
      if (reduced) snap(); else start();
      if (document.fonts && document.fonts.load) {
        document.fonts.load('700 260px "Space Grotesk"').then(() => { if (!disposed) { sampleMonogram(); if (reduced) snap(); } }).catch(() => {});
      }
      listen(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => resize(false), 150); });
      listen(document, 'visibilitychange', () => { if (document.hidden) stop(); else start(); });
      listen(window, 'pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = e.pointerType === 'mouse' || e.pressure > 0; }, { passive: true });
      listen(document, 'pointerleave', () => { ptr.on = false; });
      listen(window, 'pointerup', (e) => { if (e.pointerType !== 'mouse') ptr.on = false; });
      listen(window, 'pointerdown', (e) => { if (!reduced && !e.target.closest('a,button')) bursts.push({ x: e.clientX, y: e.clientY, t: performance.now() }); });
    }
    function setReduced(v) { reduced = v; if (v) { stop(); snap(); } else start(); }

    return { init, setShape, setReduced, destroy() { disposed = true; stop(); clearTimeout(rt); listeners.abort(); }, get shape() { return shape; } };

}

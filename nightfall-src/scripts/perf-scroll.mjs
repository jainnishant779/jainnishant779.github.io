// Scroll-smoothness probe: wheel-scrolls the home page top to bottom and reports frame-time stats.
// Usage: node scripts/perf-scroll.mjs [label]      (needs a build + `vite preview` on :4173, or it starts one)
// Headless software rendering is slower than a real GPU, so compare numbers between runs, not against 60 fps.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const BASE = 'http://localhost:4173/nightfall';
const LABEL = process.argv[2] || 'run';
const up = async () => {
  try {
    return (await fetch(`${BASE}/`)).ok;
  } catch {
    return false;
  }
};

let server = null;
if (!(await up())) {
  server = spawn('npm run preview', { shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist'] });
const results = [];

for (const vp of [{ name: 'desktop 1440x900', width: 1440, height: 900 }, { name: 'mobile 390x844', width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.film-canvas', { timeout: 30000 });
  await page.waitForTimeout(6000); // let frames finish loading/decoding so we measure steady state

  await page.evaluate(() => {
    window.__deltas = [];
    let last = performance.now();
    const tick = (now) => {
      window.__deltas.push(now - last);
      last = now;
      window.__raf = requestAnimationFrame(tick);
    };
    window.__raf = requestAnimationFrame(tick);
  });

  await page.mouse.move(vp.width / 2, vp.height / 2);
  const steps = 260;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 24);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(1200);

  const deltas = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    return window.__deltas.slice(5);
  });
  const sorted = [...deltas].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  results.push({
    viewport: vp.name,
    frames: deltas.length,
    avgFps: +(1000 / avg).toFixed(1),
    p50ms: +pct(0.5).toFixed(1),
    p95ms: +pct(0.95).toFixed(1),
    p99ms: +pct(0.99).toFixed(1),
    maxMs: +sorted[sorted.length - 1].toFixed(1),
    over33ms: deltas.filter((d) => d > 33.4).length,
    over50ms: deltas.filter((d) => d > 50).length,
  });
  await ctx.close();
}

await browser.close();
if (server) server.kill();
console.log(`[perf-scroll] ${LABEL}`);
console.table(results);

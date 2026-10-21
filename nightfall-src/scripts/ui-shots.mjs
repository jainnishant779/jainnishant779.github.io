// Screenshots every route at 3 viewports for visual review.
// Usage: node scripts/ui-shots.mjs [tag]     (tag -> tests/__shots__/ui/<tag>/, default "current")
// Needs a production build in ../nightfall. Reuses a running `vite preview` on :4173, else starts one.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://localhost:4173/nightfall';
const TAG = process.argv[2] || 'current';
const OUT = path.join(ROOT, 'tests', '__shots__', 'ui', TAG);

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1366', width: 1366, height: 768 },
  { name: '390', width: 390, height: 844, isMobile: true, hasTouch: true },
];

const ROUTES = [
  { name: 'home-top', path: '/', scroll: 0, wait: 2500 },
  { name: 'home-end', path: '/', scroll: 1, wait: 4500 },
  { name: 'os', path: '/os' },
  { name: 'about', path: '/about' },
  { name: 'projects', path: '/projects' },
  { name: 'project-edgedesk', path: '/projects/edgedesk' },
  { name: 'experience', path: '/experience' },
  { name: 'skills', path: '/skills' },
  { name: 'achievements', path: '/achievements' },
  { name: 'contact', path: '/contact' },
  { name: 'cv', path: '/cv' },
];

async function isUp() {
  try {
    const res = await fetch(`${BASE}/`);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isUp()) return null;
  const child = spawn('npm run preview', { cwd: ROOT, shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    if (await isUp()) return child;
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error('vite preview did not start on :4173 (did you run `npm run build`?)');
}

const server = await ensureServer();
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist'] });
const written = [];
const errors = [];

try {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`[${vp.name}] ${e.message}`));
    for (const r of ROUTES) {
      await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle' }).catch(() => {});
      if (r.scroll !== undefined) {
        await page.waitForTimeout(r.wait ?? 2000);
        await page.evaluate((frac) => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, max * frac);
        }, r.scroll);
      }
      await page.waitForTimeout(r.scroll !== undefined ? (r.wait ?? 2000) : 900);
      const hOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      if (hOverflow) errors.push(`[${vp.name}] horizontal overflow on ${r.path}`);
      const file = path.join(OUT, `${r.name}-${vp.name}.png`);
      await page.screenshot({ path: file });
      written.push(path.relative(ROOT, file));
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  if (server) server.kill();
}

console.log(`Wrote ${written.length} screenshots to ${path.relative(ROOT, OUT)}`);
if (errors.length) {
  console.log('Issues:');
  for (const e of errors) console.log(' - ' + e);
}

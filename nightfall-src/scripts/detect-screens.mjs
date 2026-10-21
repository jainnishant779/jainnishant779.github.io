// Finds the three blank monitors in the FINAL film frame and writes public/film/screens.json (TL, TR, BR, BL corners
// in 1600x900 frame pixels). The result is a first guess: open /nightfall/calibrate to check and nudge the corners.
//
// How: the monitors are uniform, very dark, slightly blue rectangles. We build a mask of such pixels, label connected
// regions, keep the three biggest, and take each region's four extreme points as its corners.
// Usage: node scripts/detect-screens.mjs [--debug path/to/overlay.png]
import sharp from 'sharp';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const projectDir = join(import.meta.dirname, '..');
const filmDir = join(projectDir, 'public', 'film');
const manifest = JSON.parse(readFileSync(join(filmDir, 'manifest.json'), 'utf8'));
const lastFrame = join(filmDir, 'desktop', `f_${String(manifest.count - 1).padStart(4, '0')}.webp`);
const debugIdx = process.argv.indexOf('--debug');
const debugOut = debugIdx > -1 ? process.argv[debugIdx + 1] : null;

const W = manifest.desktop.width;
const H = manifest.desktop.height;
const S = 4; // analyse at 1/4 size
const w = W / S;
const h = H / S;

const { data } = await sharp(lastFrame).resize(w, h).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const lum = new Float32Array(w * h);
const blueish = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) {
  const r = data[i * 3];
  const g = data[i * 3 + 1];
  const b = data[i * 3 + 2];
  lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  blueish[i] = b >= r + 3 ? 1 : 0;
}

// local uniformity: standard deviation over a 5x5 window
const flat = new Uint8Array(w * h);
for (let y = 2; y < h - 2; y++) {
  for (let x = 2; x < w - 2; x++) {
    let sum = 0;
    let sum2 = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const v = lum[(y + dy) * w + (x + dx)];
        sum += v;
        sum2 += v * v;
      }
    }
    const mean = sum / 25;
    const sd = Math.sqrt(Math.max(0, sum2 / 25 - mean * mean));
    flat[y * w + x] = sd < 3.2 ? 1 : 0;
  }
}

const mask = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) mask[i] = lum[i] < 48 && blueish[i] && flat[i] ? 1 : 0;

// connected components (4-neighbour flood fill)
const label = new Int32Array(w * h);
const regions = [];
let next = 1;
for (let start = 0; start < w * h; start++) {
  if (!mask[start] || label[start]) continue;
  const stack = [start];
  label[start] = next;
  const px = [];
  while (stack.length) {
    const p = stack.pop();
    px.push(p);
    const x = p % w;
    const y = (p / w) | 0;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (mask[q] && !label[q]) {
        label[q] = next;
        stack.push(q);
      }
    }
  }
  regions.push({ id: next, px });
  next++;
}

const big = regions
  .filter((r) => r.px.length > w * h * 0.015)
  .sort((a, b) => b.px.length - a.px.length)
  .slice(0, 3);

if (big.length < 3) {
  console.error(`[detect-screens] Found ${big.length} screen-like regions (need 3). Use /calibrate to click the corners by hand.`);
  console.error('Regions (area in % of frame):', regions.map((r) => ((r.px.length / (w * h)) * 100).toFixed(1)).sort((a, b) => b - a).slice(0, 6).join(', '));
  process.exit(1);
}

function corners(region) {
  let tl = null, tr = null, br = null, bl = null;
  let tlv = Infinity, trv = -Infinity, brv = -Infinity, blv = Infinity;
  for (const p of region.px) {
    const x = p % w;
    const y = (p / w) | 0;
    if (x + y < tlv) { tlv = x + y; tl = [x, y]; }
    if (x - y > trv) { trv = x - y; tr = [x, y]; }
    if (x + y > brv) { brv = x + y; br = [x, y]; }
    if (x - y < blv) { blv = x - y; bl = [x, y]; }
  }
  // pixel centres -> frame pixels, pushed 1 analysis-pixel outward so the quad covers the whole screen
  const up = (pt, dx, dy) => [Math.round((pt[0] + 0.5 + dx) * S), Math.round((pt[1] + 0.5 + dy) * S)];
  return [up(tl, -1, -1), up(tr, 1, -1), up(br, 1, 1), up(bl, -1, 1)];
}

const sorted = big.map((r) => ({ r, q: corners(r) })).sort((a, b) => a.q[0][0] - b.q[0][0]);
const screens = { left: sorted[0].q, center: sorted[1].q, right: sorted[2].q };

// the centre monitor should be the widest; warn when the picture looks wrong
const widthOf = (q) => Math.max(q[1][0] - q[0][0], q[2][0] - q[3][0]);
if (widthOf(screens.center) < widthOf(screens.left) * 0.8 || widthOf(screens.center) < widthOf(screens.right) * 0.8) {
  console.warn('[detect-screens] WARNING: the centre region is not the widest. Check the result in /calibrate.');
}

writeFileSync(join(filmDir, 'screens.json'), JSON.stringify(screens, null, 2));
console.log('[detect-screens] wrote public/film/screens.json');
console.log(JSON.stringify(screens));

if (debugOut) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${(['left', 'center', 'right'])
    .map((k, i) => `<polygon points="${screens[k].map((p) => p.join(',')).join(' ')}" fill="rgba(255,160,0,0.25)" stroke="${['#00e5ff', '#ffa500', '#7fb38a'][i]}" stroke-width="3"/>`)
    .join('')}</svg>`;
  await sharp(lastFrame).composite([{ input: Buffer.from(svg) }]).png().toFile(debugOut);
  console.log('[detect-screens] debug overlay:', debugOut);
}

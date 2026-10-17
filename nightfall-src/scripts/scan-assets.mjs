import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative } from 'path';

const publicDir = join(import.meta.dirname, '..', 'public');
const assetsDir = join(publicDir, 'assets');
const outFile = join(assetsDir, 'available.json');

function walk(dir, base = '') {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) {
      results.push(...walk(full, rel));
    } else if (entry !== 'available.json') {
      results.push(`assets/${rel}`);
    }
  }
  return results;
}

const assets = walk(assetsDir);
if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(assets, null, 2));
console.log(`[scan-assets] Found ${assets.length} assets`);

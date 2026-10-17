import { existsSync } from 'fs';
import { join } from 'path';

const assetsDir = join(import.meta.dirname, '..', 'public', 'assets');

if (!existsSync(assetsDir)) {
  console.log('[optimize-assets] No assets directory found. Skipping.');
  process.exit(0);
}

console.log('[optimize-assets] Asset optimization requires sharp and @gltf-transform/cli.');
console.log('Run this script after downloading CC0/CC-BY textures and models.');
console.log('See ASSETS.md for details.');

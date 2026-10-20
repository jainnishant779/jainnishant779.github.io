import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const outDir = join(import.meta.dirname, '..', '..', 'nightfall');
const indexFile = join(outDir, 'index.html');

if (!existsSync(indexFile)) {
  console.error('[make-route-pages] No index.html found in build output');
  process.exit(1);
}

const routes = [
  'os',
  'about',
  'projects',
  'projects/edgedesk',
  'projects/crowd-analytics',
  'projects/poultry-health-ai',
  'projects/on-device-ai',
  'projects/parkfnb',
  'projects/facial-attendance',
  'projects/lora-traffic-mesh',
  'experience',
  'skills',
  'achievements',
  'contact',
  'cv',
];

for (const route of routes) {
  const dir = join(outDir, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(indexFile, join(dir, 'index.html'));
}

// Also copy to 404.html for catch-all
copyFileSync(indexFile, join(outDir, '404.html'));

console.log(`[make-route-pages] Created ${routes.length} route pages + 404.html`);

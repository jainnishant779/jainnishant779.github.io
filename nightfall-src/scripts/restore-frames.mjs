import sharp from 'sharp';
import { join } from 'path';

const scriptDir = import.meta.dirname;
const projectDir = join(scriptDir, '..');
const srcDir = join(projectDir, '..', 'assets', 'cave_frames');
const deskDir = join(projectDir, 'public', 'film', 'desktop');
const mobDir = join(projectDir, 'public', 'film', 'mobile');

async function restore() {
  console.log('[restore-frames] Restoring smooth frames 195-239 from assets/cave_frames...');
  for (let i = 195; i <= 239; i++) {
    const srcNum = String(i).padStart(3, '0');
    const dstNum = String(i).padStart(4, '0');
    const srcFile = join(srcDir, `frame_${srcNum}.webp`);
    const deskFile = join(deskDir, `f_${dstNum}.webp`);
    const mobFile = join(mobDir, `f_${dstNum}.webp`);

    await sharp(srcFile)
      .resize(1600, 900, { fit: 'cover' })
      .webp({ quality: 78, effort: 4 })
      .toFile(deskFile);

    await sharp(srcFile)
      .resize(960, 540, { fit: 'cover' })
      .webp({ quality: 68, effort: 4 })
      .toFile(mobFile);
  }
  console.log('[restore-frames] All 45 frames restored smoothly!');
}

restore().catch(console.error);

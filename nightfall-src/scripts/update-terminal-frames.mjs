import sharp from 'sharp';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const scriptDir = import.meta.dirname;
const projectDir = join(scriptDir, '..');
const k6Path = join(projectDir, 'raw', 'keyframes', 'K6.png');
const k4Path = join(projectDir, 'raw', 'keyframes', 'K4.png');
const desktopDir = join(projectDir, 'public', 'film', 'desktop');
const mobileDir = join(projectDir, 'public', 'film', 'mobile');

async function main() {
  console.log('[update-terminal-frames] Updating final terminal frames with photoreal 6-screen workstation...');

  if (!existsSync(k6Path)) {
    console.error('K6.png not found at', k6Path);
    process.exit(1);
  }

  const k6Buffer = await sharp(k6Path)
    .resize(1600, 900, { fit: 'cover' })
    .toBuffer();

  const startFrame = 195;
  const endFrame = 239;
  const totalSteps = endFrame - startFrame;

  for (let i = startFrame; i <= endFrame; i++) {
    const frameNum = String(i).padStart(4, '0');
    const deskPath = join(desktopDir, `f_${frameNum}.webp`);
    const mobPath = join(mobileDir, `f_${frameNum}.webp`);

    // Subtle forward dolly into the workstation (from scale 0.94 to 1.0)
    const factor = (i - startFrame) / totalSteps;
    const scale = 0.94 + 0.06 * factor; // 0.94 to 1.00
    const cropW = Math.round(1600 / scale);
    const cropH = Math.round(900 / scale);

    // Desktop frame (1600x900)
    await sharp(k6Buffer)
      .resize(cropW, cropH, { fit: 'cover' })
      .extract({
        left: Math.round((cropW - 1600) / 2),
        top: Math.round((cropH - 900) / 2),
        width: 1600,
        height: 900,
      })
      .webp({ quality: 78, effort: 4 })
      .toFile(deskPath);

    // Mobile frame (960x540)
    await sharp(deskPath)
      .resize(960, 540, { fit: 'cover' })
      .webp({ quality: 68, effort: 4 })
      .toFile(mobPath);

    if (i % 10 === 0 || i === endFrame) {
      console.log(`[update-terminal-frames] Generated frame ${frameNum} (scale: ${scale.toFixed(3)})`);
    }
  }

  console.log('[update-terminal-frames] Successfully updated frames 195-239 with photoreal 6-screen workstation!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

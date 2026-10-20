import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const vaultPath = 'Cinematic Sci-Fi Vault Entrance.png';
const k2Path = 'nightfall-src/raw/keyframes/K2.png';
const k3DesktopPath = 'nightfall-src/public/film/desktop/f_0048.webp';
const k3MobilePath = 'nightfall-src/public/film/mobile/f_0048.webp';

const desktopDir = 'nightfall-src/public/film/desktop';
const mobileDir = 'nightfall-src/public/film/mobile';

async function generateAllFrames() {
  console.log('[gate-gen] Generating 49 photorealistic entrance frames (desktop + mobile)...');

  // Load Desktop masters (1600x900)
  const W_D = 1600;
  const H_D = 900;
  const k1RawD = await sharp(vaultPath).resize(W_D, H_D, { fit: 'cover' }).raw().toBuffer();
  const k2RawD = await sharp(k2Path).resize(W_D, H_D, { fit: 'cover' }).raw().toBuffer();
  const k3RawD = await sharp(k3DesktopPath).resize(W_D, H_D, { fit: 'cover' }).raw().toBuffer();

  // Load Mobile masters (960x540)
  const W_M = 960;
  const H_M = 540;
  const k1RawM = await sharp(vaultPath).resize(W_M, H_M, { fit: 'cover' }).raw().toBuffer();
  const k2RawM = await sharp(k2Path).resize(W_M, H_M, { fit: 'cover' }).raw().toBuffer();
  const k3RawM = await sharp(k3MobilePath).resize(W_M, H_M, { fit: 'cover' }).raw().toBuffer();

  const total = 49;

  for (let i = 0; i < total; i++) {
    const p = i / (total - 1);
    const frameNum = String(i).padStart(4, '0');
    const outDeskPath = path.join(desktopDir, `f_${frameNum}.webp`);
    const outMobPath = path.join(mobileDir, `f_${frameNum}.webp`);

    // For frame 48, keep exact existing f_0048 to guarantee 100% seamless continuity
    if (i === 48) {
      console.log(`[gate-gen] Frame 48 preserved for 100% seam match`);
      continue;
    }

    let splitProgress = 0;
    if (p > 0.16) {
      splitProgress = Math.min(1.0, (p - 0.16) / 0.58);
      // Smooth cubic ease-in-out
      splitProgress = splitProgress < 0.5
        ? 4 * splitProgress * splitProgress * splitProgress
        : 1 - Math.pow(-2 * splitProgress + 2, 3) / 2;
    }

    const k3Weight = Math.max(0, Math.min(1.0, (p - 0.55) / 0.42));
    const k2Weight = 1.0 - k3Weight;

    // Desktop Frame Render
    const outBufD = Buffer.alloc(W_D * H_D * 3);
    const slideShiftD = Math.round(splitProgress * 420);
    const centerXD = W_D / 2;
    const currentHalfGapD = splitProgress * (W_D * 0.52);

    for (let y = 0; y < H_D; y++) {
      const rowOffset = y * W_D * 3;
      for (let x = 0; x < W_D; x++) {
        const px = rowOffset + x * 3;
        const distFromCenter = Math.abs(x - centerXD);

        const cavR = k2RawD[px] * k2Weight + k3RawD[px] * k3Weight;
        const cavG = k2RawD[px + 1] * k2Weight + k3RawD[px + 1] * k3Weight;
        const cavB = k2RawD[px + 2] * k2Weight + k3RawD[px + 2] * k3Weight;

        let srcX = x;
        if (x < centerXD) {
          srcX = Math.min(centerXD - 1, x + slideShiftD);
        } else {
          srcX = Math.max(centerXD, x - slideShiftD);
        }
        const srcPx = rowOffset + srcX * 3;
        const gateR = k1RawD[srcPx];
        const gateG = k1RawD[srcPx + 1];
        const gateB = k1RawD[srcPx + 2];

        let mask = 0;
        if (splitProgress > 0) {
          if (distFromCenter < currentHalfGapD - 12) {
            mask = 1.0;
          } else if (distFromCenter < currentHalfGapD + 12) {
            mask = 0.5 + (currentHalfGapD - distFromCenter) / 24;
          }
        }

        let glow = 0;
        if (splitProgress > 0.02 && splitProgress < 0.88) {
          const edgeDist = Math.abs(distFromCenter - currentHalfGapD);
          if (edgeDist < 30) {
            glow = (1 - edgeDist / 30) * 55 * Math.sin(splitProgress * Math.PI);
          }
        }

        const r = gateR * (1 - mask) + cavR * mask + glow * 1.0;
        const g = gateG * (1 - mask) + cavG * mask + glow * 0.72;
        const b = gateB * (1 - mask) + cavB * mask + glow * 0.32;

        outBufD[px] = Math.min(255, Math.max(0, Math.round(r)));
        outBufD[px + 1] = Math.min(255, Math.max(0, Math.round(g)));
        outBufD[px + 2] = Math.min(255, Math.max(0, Math.round(b)));
      }
    }

    // Mobile Frame Render
    const outBufM = Buffer.alloc(W_M * H_M * 3);
    const slideShiftM = Math.round(splitProgress * 252);
    const centerXM = W_M / 2;
    const currentHalfGapM = splitProgress * (W_M * 0.52);

    for (let y = 0; y < H_M; y++) {
      const rowOffset = y * W_M * 3;
      for (let x = 0; x < W_M; x++) {
        const px = rowOffset + x * 3;
        const distFromCenter = Math.abs(x - centerXM);

        const cavR = k2RawM[px] * k2Weight + k3RawM[px] * k3Weight;
        const cavG = k2RawM[px + 1] * k2Weight + k3RawM[px + 1] * k3Weight;
        const cavB = k2RawM[px + 2] * k2Weight + k3RawM[px + 2] * k3Weight;

        let srcX = x;
        if (x < centerXM) {
          srcX = Math.min(centerXM - 1, x + slideShiftM);
        } else {
          srcX = Math.max(centerXM, x - slideShiftM);
        }
        const srcPx = rowOffset + srcX * 3;
        const gateR = k1RawM[srcPx];
        const gateG = k1RawM[srcPx + 1];
        const gateB = k1RawM[srcPx + 2];

        let mask = 0;
        if (splitProgress > 0) {
          if (distFromCenter < currentHalfGapM - 8) {
            mask = 1.0;
          } else if (distFromCenter < currentHalfGapM + 8) {
            mask = 0.5 + (currentHalfGapM - distFromCenter) / 16;
          }
        }

        let glow = 0;
        if (splitProgress > 0.02 && splitProgress < 0.88) {
          const edgeDist = Math.abs(distFromCenter - currentHalfGapM);
          if (edgeDist < 20) {
            glow = (1 - edgeDist / 20) * 55 * Math.sin(splitProgress * Math.PI);
          }
        }

        const r = gateR * (1 - mask) + cavR * mask + glow * 1.0;
        const g = gateG * (1 - mask) + cavG * mask + glow * 0.72;
        const b = gateB * (1 - mask) + cavB * mask + glow * 0.32;

        outBufM[px] = Math.min(255, Math.max(0, Math.round(r)));
        outBufM[px + 1] = Math.min(255, Math.max(0, Math.round(g)));
        outBufM[px + 2] = Math.min(255, Math.max(0, Math.round(b)));
      }
    }

    // Write desktop and mobile WebP
    await Promise.all([
      sharp(outBufD, { raw: { width: W_D, height: H_D, channels: 3 } })
        .webp({ quality: 75, effort: 4 })
        .toFile(outDeskPath),
      sharp(outBufM, { raw: { width: W_M, height: H_M, channels: 3 } })
        .webp({ quality: 68, effort: 4 })
        .toFile(outMobPath),
    ]);

    if (i % 8 === 0 || i === total - 2) {
      console.log(`[gate-gen] Generated frames up to ${frameNum} (split=${splitProgress.toFixed(2)})`);
    }
  }

  console.log('[gate-gen] All 49 entrance frames successfully generated and written!');
}

generateAllFrames().catch(console.error);

import { existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const scriptDir = import.meta.dirname;
const projectDir = join(scriptDir, '..');
const rawClipsDir = join(projectDir, 'raw', 'clips');
const fallbackFramesDir = join(projectDir, '..', 'assets', 'cave_frames');
const publicFilmDir = join(projectDir, 'public', 'film');
const desktopDir = join(publicFilmDir, 'desktop');
const mobileDir = join(publicFilmDir, 'mobile');
const manifestPath = join(publicFilmDir, 'manifest.json');

// Ensure output directories exist
mkdirSync(desktopDir, { recursive: true });
mkdirSync(mobileDir, { recursive: true });

function findFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    // Check known Windows WinGet paths
    const localAppData = process.env.LOCALAPPDATA || '';
    const knownPaths = [
      join(localAppData, 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-9.0.2-full_build', 'bin', 'ffmpeg.exe'),
      join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    ];
    for (const p of knownPaths) {
      if (existsSync(p)) return `"${p}"`;
    }
  }
  return null;
}

async function processFrames(sourceFiles, isTemp = false) {
  const total = sourceFiles.length;
  console.log(`[build-film] Processing ${total} frames to desktop (1600x900 @ q72) and mobile (960x540 @ q65)...`);

  const batchSize = 10;
  for (let i = 0; i < total; i += batchSize) {
    const batch = sourceFiles.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file, batchIdx) => {
        const frameIndex = i + batchIdx;
        const frameNum = String(frameIndex).padStart(4, '0');
        const deskPath = join(desktopDir, `f_${frameNum}.webp`);
        const mobPath = join(mobileDir, `f_${frameNum}.webp`);

        const pipeline = sharp(file);
        await Promise.all([
          pipeline
            .clone()
            .resize(1600, 900, { fit: 'cover' })
            .webp({ quality: 72, effort: 4 })
            .toFile(deskPath),
          pipeline
            .clone()
            .resize(960, 540, { fit: 'cover' })
            .webp({ quality: 65, effort: 4 })
            .toFile(mobPath),
        ]);
      })
    );
    if ((i + batchSize) % 50 === 0 || i + batchSize >= total) {
      console.log(`[build-film] Completed ${Math.min(i + batchSize, total)} / ${total} frames`);
    }
  }

  // Create manifest
  const manifest = {
    count: total,
    fps: 12,
    desktop: {
      width: 1600,
      height: 900,
      pattern: 'film/desktop/f_%04d.webp',
    },
    mobile: {
      width: 960,
      height: 540,
      pattern: 'film/mobile/f_%04d.webp',
    },
    segments: [
      { id: 'gate', start: 0, end: Math.floor(total * 0.2) },
      { id: 'walk', start: Math.floor(total * 0.2), end: Math.floor(total * 0.6) },
      { id: 'approach', start: Math.floor(total * 0.6), end: Math.floor(total * 0.8) },
      { id: 'terminal', start: Math.floor(total * 0.8), end: total - 1 },
    ],
    // Calibrated monitor quad in 1600x900 coordinate space (top-left, top-right, bottom-right, bottom-left)
    screenQuad: [
      [360, 182],
      [1240, 182],
      [1240, 677],
      [360, 677],
    ],
  };

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[build-film] Manifest written to ${manifestPath}`);
}

async function main() {
  const clips = ['C1.mp4', 'C2.mp4', 'C3.mp4', 'C4.mp4', 'C5.mp4'].map((c) => join(rawClipsDir, c));
  const clipsExist = clips.every((c) => existsSync(c));

  if (clipsExist) {
    const ffmpeg = findFFmpeg();
    if (!ffmpeg) {
      console.error('[build-film] ERROR: FFmpeg not found on system. Please ensure FFmpeg is installed.');
      process.exit(1);
    }
    console.log(`[build-film] Found all 5 raw clips. Extracting frames using ${ffmpeg}...`);
    const tempDir = join(projectDir, '.temp_frames');
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    const allExtractedFrames = [];

    for (let c = 0; c < clips.length; c++) {
      const clipPath = clips[c];
      const clipTempDir = join(tempDir, `clip_${c + 1}`);
      mkdirSync(clipTempDir, { recursive: true });
      console.log(`[build-film] Extracting ${clips[c]}...`);
      execSync(`${ffmpeg} -y -i "${clipPath}" -vf "fps=12" "${join(clipTempDir, 'frame_%05d.png')}"`, {
        stdio: 'inherit',
      });

      const frameFiles = readdirSync(clipTempDir)
        .filter((f) => f.endsWith('.png'))
        .sort();

      // Stitching rule: for clips C2 through C5, drop frame 0 to avoid duplicates
      const framesToKeep = c === 0 ? frameFiles : frameFiles.slice(1);
      for (const f of framesToKeep) {
        allExtractedFrames.push(join(clipTempDir, f));
      }
    }

    await processFrames(allExtractedFrames, true);
    rmSync(tempDir, { recursive: true, force: true });
    console.log('[build-film] Film build completed successfully from raw clips!');
  } else if (existsSync(fallbackFramesDir)) {
    console.log(`[build-film] Raw clips not found in ${rawClipsDir}. Using fallback frames from ${fallbackFramesDir}...`);
    const fallbackFiles = readdirSync(fallbackFramesDir)
      .filter((f) => (f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg')) && f !== 'frame_000.webp')
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      })
      .map((f) => join(fallbackFramesDir, f));

    if (fallbackFiles.length === 0) {
      console.error('[build-film] No frames found in fallback directory.');
      process.exit(1);
    }

    await processFrames(fallbackFiles, false);
    console.log('[build-film] Film build completed successfully from fallback frames!');
  } else {
    console.error(`[build-film] No clips found in ${rawClipsDir} and no fallback frames in ${fallbackFramesDir}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[build-film] Fatal error:', err);
  process.exit(1);
});

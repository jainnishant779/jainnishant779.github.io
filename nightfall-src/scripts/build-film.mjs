import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'fs';
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

// Tunables (override with env vars, e.g. `$env:FILM_FPS=10; npm run film`)
const FPS = Number(process.env.FILM_FPS || 12);
const Q_DESKTOP = Number(process.env.FILM_QUALITY || 74);
const Q_MOBILE = Math.max(50, Q_DESKTOP - 8);
const screensJsonPath = join(publicFilmDir, 'screens.json');

// Ensure output directories exist
mkdirSync(desktopDir, { recursive: true });
mkdirSync(mobileDir, { recursive: true });

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function dirSizeMB(dir) {
  return readdirSync(dir).reduce((sum, f) => sum + statSync(join(dir, f)).size, 0) / 1024 / 1024;
}

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

async function processFrames(sourceFiles, segmentsOverride = null) {
  const total = sourceFiles.length;
  console.log(
    `[build-film] Processing ${total} frames to desktop (1600x900 @ q${Q_DESKTOP}) and mobile (960x540 @ q${Q_MOBILE})...`,
  );

  // Remove stale frames from a previous (longer) film so they are not published.
  for (const dir of [desktopDir, mobileDir]) {
    for (const f of readdirSync(dir)) if (f.endsWith('.webp')) rmSync(join(dir, f));
  }

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
            .webp({ quality: Q_DESKTOP, effort: 4 })
            .toFile(deskPath),
          pipeline
            .clone()
            .resize(960, 540, { fit: 'cover' })
            .webp({ quality: Q_MOBILE, effort: 4 })
            .toFile(mobPath),
        ]);
      })
    );
    if ((i + batchSize) % 50 === 0 || i + batchSize >= total) {
      console.log(`[build-film] Completed ${Math.min(i + batchSize, total)} / ${total} frames`);
    }
  }

  // Keep the calibrated monitor corners: screens.json (from the /calibrate page) wins, then the previous manifest.
  const screens = readJson(screensJsonPath);
  const previous = readJson(manifestPath);
  const screenQuad = screens?.center ?? previous?.screenQuad ?? [
    [492, 312],
    [1108, 312],
    [1108, 746],
    [492, 746],
  ];

  // Create manifest
  const manifest = {
    count: total,
    fps: FPS,
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
    segments:
      segmentsOverride ?? [
        { id: 'gate', start: 0, end: Math.floor(total * 0.2) },
        { id: 'walk', start: Math.floor(total * 0.2), end: Math.floor(total * 0.6) },
        { id: 'approach', start: Math.floor(total * 0.6), end: Math.floor(total * 0.8) },
        { id: 'terminal', start: Math.floor(total * 0.8), end: total - 1 },
      ],
    // Centre monitor corners (TL, TR, BR, BL) in 1600x900 frame pixels. All three monitors live in screens.json.
    screenQuad,
  };

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[build-film] Manifest written to ${manifestPath}`);

  const deskMB = dirSizeMB(desktopDir);
  const mobMB = dirSizeMB(mobileDir);
  console.log(`[build-film] Output: ${total} frames, desktop ${deskMB.toFixed(1)} MB, mobile ${mobMB.toFixed(1)} MB`);
  if (deskMB > 30) console.warn('[build-film] WARNING: desktop set is over 30 MB. Try FILM_FPS=10 or FILM_QUALITY=68.');
  if (!screens) {
    console.warn(
      '[build-film] NOTE: no public/film/screens.json. If the last frame changed, open /nightfall/calibrate and click the monitor corners.',
    );
  }
}

async function main() {
  // Any clips named C1.mp4, C2.mp4, ... in raw/clips, in numeric order (each clip ends where the next begins).
  const clipNames = existsSync(rawClipsDir)
    ? readdirSync(rawClipsDir)
        .filter((f) => /^C\d+\.mp4$/i.test(f))
        .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
    : [];
  const clips = clipNames.map((c) => join(rawClipsDir, c));
  const clipsExist = clips.length > 0;

  if (clipsExist) {
    const ffmpeg = findFFmpeg();
    if (!ffmpeg) {
      console.error('[build-film] ERROR: FFmpeg not found on system. Please ensure FFmpeg is installed.');
      process.exit(1);
    }
    console.log(`[build-film] Found ${clips.length} raw clips (${clipNames.join(', ')}). Extracting at ${FPS} fps using ${ffmpeg}...`);
    const tempDir = join(projectDir, '.temp_frames');
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    const allExtractedFrames = [];
    const segments = [];

    for (let c = 0; c < clips.length; c++) {
      const clipPath = clips[c];
      const clipTempDir = join(tempDir, `clip_${c + 1}`);
      mkdirSync(clipTempDir, { recursive: true });
      console.log(`[build-film] Extracting ${clips[c]}...`);
      execSync(`${ffmpeg} -y -i "${clipPath}" -vf "fps=${FPS}" "${join(clipTempDir, 'frame_%05d.png')}"`, {
        stdio: 'inherit',
      });

      const frameFiles = readdirSync(clipTempDir)
        .filter((f) => f.endsWith('.png'))
        .sort();

      // Stitching rule: for clips C2 through C5, drop frame 0 to avoid duplicates
      const framesToKeep = c === 0 ? frameFiles : frameFiles.slice(1);
      const start = allExtractedFrames.length;
      for (const f of framesToKeep) {
        allExtractedFrames.push(join(clipTempDir, f));
      }
      segments.push({ id: clipNames[c].replace(/\.mp4$/i, ''), start, end: allExtractedFrames.length - 1 });
    }

    await processFrames(allExtractedFrames, segments);
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

    await processFrames(fallbackFiles);
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

// Builds public/film/* (the scroll-scrubbed film) from raw/clips/*.mp4.
//
// Default: every raw/clips/C<n>.mp4 in numeric order, joined hard (the first frame of each following clip is dropped).
// Storyboard: nightfall-src/film-storyboard.json can pick, trim, reverse and dissolve clips, and remove the Flow/Veo watermark:
//   {
//     "holdEnd": 0.06,                                   // last 6% of the scroll holds the final frame (OS panels live there)
//     "delogo": { "cx": 0.906, "cy": 0.833, "size": 0.043 },   // watermark box as fractions of the frame; false disables
//     "clips": [ { "file": "C1.mp4", "fps": 10 },
//                { "file": "C3.mp4", "start": 0, "end": 5.2, "fadeIn": 1.0 },    // dissolve over 1 s from the previous clip
//                { "file": "C2.mp4", "reverse": true } ]
//   }
// Env overrides: FILM_FPS (default 12), FILM_QUALITY (default 74).
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const scriptDir = import.meta.dirname;
const projectDir = join(scriptDir, '..');
const rawClipsDir = join(projectDir, 'raw', 'clips');
const storyboardPath = join(projectDir, 'film-storyboard.json');
const fallbackFramesDir = join(projectDir, '..', 'assets', 'cave_frames');
const publicFilmDir = join(projectDir, 'public', 'film');
const desktopDir = join(publicFilmDir, 'desktop');
const mobileDir = join(publicFilmDir, 'mobile');
const manifestPath = join(publicFilmDir, 'manifest.json');
const screensJsonPath = join(publicFilmDir, 'screens.json');

const FPS = Number(process.env.FILM_FPS || 12);
const Q_DESKTOP = Number(process.env.FILM_QUALITY || 74);
const Q_MOBILE = Math.max(50, Q_DESKTOP - 8);
const OUT_W = 1600;
const OUT_H = 900;

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
    const localAppData = process.env.LOCALAPPDATA || '';
    const knownPaths = [
      join(localAppData, 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-9.0.2-full_build', 'bin', 'ffmpeg.exe'),
      join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    ];
    for (const p of knownPaths) if (existsSync(p)) return `"${p}"`;
  }
  return null;
}

/** Reads the video size from ffmpeg's own banner (works without ffprobe). */
function videoSize(ffmpeg, src) {
  let text = '';
  try {
    text = execSync(`${ffmpeg} -hide_banner -i "${src}" 2>&1`, { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    text = `${e.stdout ?? ''}${e.stderr ?? ''}`;
  }
  const m = text.match(/Video:.*?,\s*(\d{2,5})x(\d{2,5})/);
  if (!m) throw new Error(`Cannot read the video size of ${src}`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

/** Extracts one storyboard entry to PNG frames and returns their paths in playback order. */
function extractClip(ffmpeg, entry, index, tempDir, delogo) {
  const src = join(rawClipsDir, entry.file);
  if (!existsSync(src)) throw new Error(`Missing clip ${entry.file} in raw/clips`);
  const fps = entry.fps ?? FPS;
  const outDir = join(tempDir, `clip_${index + 1}`);
  mkdirSync(outDir, { recursive: true });

  const filters = [];
  if (delogo) {
    const { w: W, h: H } = videoSize(ffmpeg, src);
    const size = Math.ceil(delogo.size * W);
    const x = Math.max(1, Math.round(delogo.cx * W - size / 2));
    const y = Math.max(1, Math.round(delogo.cy * H - size / 2));
    filters.push(`delogo=x=${x}:y=${y}:w=${Math.min(size, W - x - 1)}:h=${Math.min(size, H - y - 1)}`);
  }
  if (entry.reverse) filters.push('reverse');
  filters.push(`fps=${fps}`);

  const ss = entry.start ? `-ss ${entry.start} ` : '';
  const dur = entry.end != null ? `-t ${entry.end - (entry.start ?? 0)} ` : '';
  console.log(`[build-film] ${entry.file}: ${fps} fps${entry.start || entry.end != null ? `, ${entry.start ?? 0}s-${entry.end ?? 'end'}s` : ''}${entry.reverse ? ', reversed' : ''}${delogo ? ', watermark removed' : ''}`);
  execSync(`${ffmpeg} -y -v error ${ss}-i "${join(src)}" ${dur}-an -vf "${filters.join(',')}" "${join(outDir, 'f_%05d.png')}"`, {
    stdio: 'inherit',
  });
  return readdirSync(outDir)
    .filter((f) => f.endsWith('.png'))
    .sort()
    .map((f) => join(outDir, f));
}

/** Cross-dissolve: the b frame laid over the a frame with the given opacity (both normalised to 1600x900). */
async function blendFrames(aPath, bPath, alpha, outPath) {
  const a = await sharp(aPath).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer();
  const b = await sharp(bPath).resize(OUT_W, OUT_H, { fit: 'cover' }).ensureAlpha(alpha).png().toBuffer();
  await sharp(a).composite([{ input: b }]).png().toFile(outPath);
}

async function processFrames(sourceFiles, segments = null, holdEnd = 0) {
  const total = sourceFiles.length;
  console.log(`[build-film] Encoding ${total} frames: desktop ${OUT_W}x${OUT_H} q${Q_DESKTOP}, mobile 960x540 q${Q_MOBILE}...`);

  // Remove stale frames from a previous (longer) film so they are not published.
  for (const dir of [desktopDir, mobileDir]) {
    for (const f of readdirSync(dir)) if (f.endsWith('.webp')) rmSync(join(dir, f));
  }

  const batchSize = 10;
  for (let i = 0; i < total; i += batchSize) {
    const batch = sourceFiles.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (file, batchIdx) => {
        const frameNum = String(i + batchIdx).padStart(4, '0');
        const pipeline = sharp(file);
        await Promise.all([
          pipeline.clone().resize(OUT_W, OUT_H, { fit: 'cover' }).webp({ quality: Q_DESKTOP, effort: 4 }).toFile(join(desktopDir, `f_${frameNum}.webp`)),
          pipeline.clone().resize(960, 540, { fit: 'cover' }).webp({ quality: Q_MOBILE, effort: 4 }).toFile(join(mobileDir, `f_${frameNum}.webp`)),
        ]);
      }),
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

  const manifest = {
    count: total,
    fps: FPS,
    desktop: { width: OUT_W, height: OUT_H, pattern: 'film/desktop/f_%04d.webp' },
    mobile: { width: 960, height: 540, pattern: 'film/mobile/f_%04d.webp' },
    segments:
      segments ?? [
        { id: 'gate', start: 0, end: Math.floor(total * 0.2) },
        { id: 'walk', start: Math.floor(total * 0.2), end: Math.floor(total * 0.6) },
        { id: 'approach', start: Math.floor(total * 0.6), end: Math.floor(total * 0.8) },
        { id: 'terminal', start: Math.floor(total * 0.8), end: total - 1 },
      ],
    // Fraction of the scroll at the end that holds the final frame still (the live OS panels sit on it).
    holdEnd,
    // Centre monitor corners (TL, TR, BR, BL) in frame pixels. All three monitors live in screens.json.
    screenQuad,
  };

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[build-film] Manifest written to ${manifestPath}`);

  const deskMB = dirSizeMB(desktopDir);
  const mobMB = dirSizeMB(mobileDir);
  console.log(`[build-film] Output: ${total} frames, desktop ${deskMB.toFixed(1)} MB, mobile ${mobMB.toFixed(1)} MB`);
  if (deskMB > 30) console.warn('[build-film] WARNING: desktop set is over 30 MB. Try FILM_FPS=10 or FILM_QUALITY=68.');
  if (!screens) {
    console.warn('[build-film] NOTE: no public/film/screens.json. Run `node scripts/detect-screens.mjs` or open /nightfall/calibrate.');
  }
}

function loadStoryboard() {
  const sb = readJson(storyboardPath);
  if (sb?.clips?.length) return sb;
  // Default: every C<n>.mp4 in numeric order, hard joins.
  const names = existsSync(rawClipsDir)
    ? readdirSync(rawClipsDir)
        .filter((f) => /^C\d+\.mp4$/i.test(f))
        .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
    : [];
  return { clips: names.map((file) => ({ file })), delogo: false, holdEnd: 0 };
}

async function main() {
  const storyboard = loadStoryboard();

  if (storyboard.clips.length > 0) {
    const ffmpeg = findFFmpeg();
    if (!ffmpeg) {
      console.error('[build-film] ERROR: FFmpeg not found on system. Please ensure FFmpeg is installed.');
      process.exit(1);
    }
    const delogo = storyboard.delogo === false ? null : storyboard.delogo ?? null;
    console.log(`[build-film] ${storyboard.clips.length} clips: ${storyboard.clips.map((c) => c.file).join(', ')}`);

    const tempDir = join(projectDir, '.temp_frames');
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    let frames = [];
    const segments = [];

    for (let c = 0; c < storyboard.clips.length; c++) {
      const entry = storyboard.clips[c];
      const clipFrames = extractClip(ffmpeg, entry, c, tempDir, delogo);
      if (clipFrames.length === 0) throw new Error(`No frames extracted from ${entry.file}`);

      let start = frames.length;
      if (c === 0) {
        frames = clipFrames;
      } else if (entry.fadeIn > 0) {
        // Dissolve: the last n frames so far are blended with the first n frames of this clip.
        const n = Math.max(1, Math.min(Math.round(entry.fadeIn * (entry.fps ?? FPS)), frames.length - 1, clipFrames.length - 1));
        const blendDir = join(tempDir, `blend_${c}`);
        mkdirSync(blendDir, { recursive: true });
        const tail = frames.slice(-n);
        const blended = [];
        for (let k = 0; k < n; k++) {
          const out = join(blendDir, `b_${String(k).padStart(3, '0')}.png`);
          await blendFrames(tail[k], clipFrames[k], (k + 1) / (n + 1), out);
          blended.push(out);
        }
        start = frames.length - n;
        frames = frames.slice(0, -n).concat(blended, clipFrames.slice(n));
        console.log(`[build-film] dissolve into ${entry.file} over ${n} frames`);
      } else {
        // Hard join: the previous clip's last frame is the next clip's first frame, so drop the duplicate.
        frames = frames.concat(clipFrames.slice(1));
      }
      segments.push({ id: entry.file.replace(/\.mp4$/i, ''), start, end: frames.length - 1 });
    }

    await processFrames(frames, segments, storyboard.holdEnd ?? 0);
    rmSync(tempDir, { recursive: true, force: true });
    console.log('[build-film] Film build completed successfully from raw clips!');
  } else if (existsSync(fallbackFramesDir)) {
    console.log(`[build-film] No clips in ${rawClipsDir}. Using fallback frames from ${fallbackFramesDir}...`);
    const fallbackFiles = readdirSync(fallbackFramesDir)
      .filter((f) => (f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg')) && f !== 'frame_000.webp')
      .sort((a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0))
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

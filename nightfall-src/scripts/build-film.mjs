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

async function normalised(path) {
  return sharp(path).resize(OUT_W, OUT_H, { fit: 'cover' }).png().toBuffer();
}

/** Zoom into (cx, cy) by z (centre-crop of an enlarged copy) and optionally blur. */
async function zoomed(buf, z, cx, cy, blurSigma) {
  let img = sharp(buf);
  if (z > 1.001) {
    const w = Math.round(OUT_W * z);
    const h = Math.round(OUT_H * z);
    const left = Math.min(w - OUT_W, Math.max(0, Math.round(w * cx - OUT_W / 2)));
    const top = Math.min(h - OUT_H, Math.max(0, Math.round(h * cy - OUT_H / 2)));
    img = sharp(await img.resize(w, h).png().toBuffer()).extract({ left, top, width: OUT_W, height: OUT_H });
  }
  if (blurSigma > 0.3) img = sharp(await img.png().toBuffer()).blur(blurSigma);
  return img.png().toBuffer();
}

/** One transition frame at progress t (0..1): outgoing clip zooms in, incoming clip settles, blur peaks in the middle. */
async function blendTransition(aPath, bPath, t, opts, outPath) {
  const { push = 1, cx = 0.5, cy = 0.5, blur = 0 } = opts;
  const mid = Math.sin(Math.PI * t);
  const za = 1 + (push - 1) * t;
  const zb = push - (push - 1) * t;
  const [a, b] = await Promise.all([
    normalised(aPath).then((buf) => zoomed(buf, za, cx, cy, blur * mid)),
    normalised(bPath).then((buf) => zoomed(buf, zb, cx, cy, blur * mid)),
  ]);
  const alpha = t * t * (3 - 2 * t); // smoothstep: quick through the middle
  const bOver = await sharp(b).ensureAlpha(alpha).png().toBuffer();
  await sharp(a).composite([{ input: bOver }]).png().toFile(outPath);
}

/** Per-channel mean and standard deviation of a clip (6 sampled frames, downscaled). */
async function clipStats(files) {
  const picks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => files[Math.min(files.length - 1, Math.round(p * (files.length - 1)))]);
  const sum = [0, 0, 0];
  const sum2 = [0, 0, 0];
  let n = 0;
  for (const f of picks) {
    const { data } = await sharp(f).resize(160).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 3) {
      for (let c = 0; c < 3; c++) {
        const v = data[i + c];
        sum[c] += v;
        sum2[c] += v * v;
      }
      n++;
    }
  }
  const mean = sum.map((s) => s / n);
  const std = sum2.map((s, c) => Math.sqrt(Math.max(1, s / n - mean[c] * mean[c])));
  return { mean, std };
}

/** Linear per-channel map (out = a*in + b) that moves `src` statistics toward `ref` by `s` (0..1). */
function gradeParams(src, ref, s) {
  const a = [];
  const b = [];
  for (let c = 0; c < 3; c++) {
    const gain = Math.min(1.35, Math.max(0.75, ref.std[c] / src.std[c]));
    a.push(1 + s * (gain - 1));
    b.push(s * (ref.mean[c] - gain * src.mean[c]));
  }
  return { a, b };
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

    // 1) extract every clip
    const extracted = [];
    for (let c = 0; c < storyboard.clips.length; c++) {
      const entry = storyboard.clips[c];
      const clipFrames = extractClip(ffmpeg, entry, c, tempDir, delogo);
      if (clipFrames.length === 0) throw new Error(`No frames extracted from ${entry.file}`);
      extracted.push(clipFrames);
    }

    // 2) colour-match the other clips to one reference clip, so the film reads as a single place instead of three
    const gradeCfg = storyboard.grade;
    if (gradeCfg?.reference) {
      const refIdx = storyboard.clips.findIndex((c) => c.file === gradeCfg.reference);
      if (refIdx < 0) throw new Error(`grade.reference ${gradeCfg.reference} is not in the storyboard`);
      const ref = await clipStats(extracted[refIdx]);
      const strength = gradeCfg.strength ?? 0.6;
      for (let c = 0; c < extracted.length; c++) {
        if (c === refIdx) continue;
        const { a, b } = gradeParams(await clipStats(extracted[c]), ref, strength);
        console.log(
          `[build-film] grade ${storyboard.clips[c].file} -> ${gradeCfg.reference} (strength ${strength}): gain ${a.map((x) => x.toFixed(2)).join('/')}, offset ${b.map((x) => x.toFixed(0)).join('/')}`,
        );
        for (const f of extracted[c]) await writeFile(f, await sharp(f).linear(a, b).png().toBuffer());
      }
    }

    // 3) join the clips
    let frames = [];
    const segments = [];
    for (let c = 0; c < storyboard.clips.length; c++) {
      const entry = storyboard.clips[c];
      const clipFrames = extracted[c];

      let start = frames.length;
      if (c === 0) {
        frames = clipFrames;
      } else if (entry.fadeIn > 0) {
        // Transition: the last n frames so far are blended with the first n frames of this clip. With `push` the camera
        // seems to move through the cut (outgoing frames zoom in, incoming frames settle from zoomed in) and `blur`
        // softens the middle so the two scenes never show as a ghosted double exposure.
        const n = Math.max(1, Math.min(Math.round(entry.fadeIn * (entry.fps ?? FPS)), frames.length - 1, clipFrames.length - 1));
        const blendDir = join(tempDir, `blend_${c}`);
        mkdirSync(blendDir, { recursive: true });
        const tail = frames.slice(-n);
        const blended = [];
        for (let k = 0; k < n; k++) {
          const out = join(blendDir, `b_${String(k).padStart(3, '0')}.png`);
          await blendTransition(tail[k], clipFrames[k], (k + 1) / (n + 1), entry.transition ?? {}, out);
          blended.push(out);
        }
        start = frames.length - n;
        frames = frames.slice(0, -n).concat(blended, clipFrames.slice(n));
        console.log(`[build-film] transition into ${entry.file} over ${n} frames${entry.transition ? ` (${JSON.stringify(entry.transition)})` : ''}`);
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

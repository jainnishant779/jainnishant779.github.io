import { useState, useEffect, useRef, useCallback } from 'react';
import type { Quad } from './quad';

export interface FilmSegment {
  id: string;
  start: number;
  end: number;
}

/** Calibrated corners (TL, TR, BR, BL) of the three monitors in the FINAL frame, in native frame pixels. */
export interface ScreenQuads {
  left: Quad;
  center: Quad;
  right: Quad;
}

export interface FilmManifest {
  count: number;
  fps: number;
  desktop: {
    width: number;
    height: number;
    pattern: string;
  };
  mobile: {
    width: number;
    height: number;
    pattern: string;
  };
  segments: FilmSegment[];
  screenQuad: Quad;
  /** Filled from public/film/screens.json when it exists (see the /calibrate page). */
  screens?: ScreenQuads;
}

type Decoded = ImageBitmap | HTMLImageElement;

const FETCH_CONCURRENCY = 6;
const DECODE_CONCURRENCY = 3;
/** Decoded frames this far outside the active window are released. */
const EVICT_MARGIN = 6;

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 960 || ('ontouchstart' in window && window.innerWidth <= 1024);
}

function closeDecoded(d: Decoded | null) {
  if (d && 'close' in d) d.close();
}

async function decodeBlob(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isQuad(q: unknown): q is Quad {
  return (
    Array.isArray(q) &&
    q.length === 4 &&
    q.every((p) => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && Number.isFinite(n)))
  );
}

function isScreenQuads(s: unknown): s is ScreenQuads {
  const o = s as Partial<ScreenQuads> | null;
  return !!o && isQuad(o.left) && isQuad(o.center) && isQuad(o.right);
}

/**
 * Loads the scroll film.
 *
 * Memory model: every frame's compressed bytes (a few MB in total) stay in memory, but only a sliding window of frames
 * around the current scroll position is decoded to bitmaps. Decoding all 240 frames at 1600x900 would need ~1.4 GB.
 */
export function useFrameLoader() {
  const [manifest, setManifest] = useState<FilmManifest | null>(null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(detectMobile);

  const blobsRef = useRef<(Blob | null)[]>([]);
  const decodedRef = useRef<(Decoded | null)[]>([]);
  const pinnedRef = useRef<Set<number>>(new Set());
  const decodingRef = useRef<Set<number>>(new Set());
  const queueRef = useRef<number[]>([]);
  const windowRef = useRef({ lo: 0, hi: 0 });
  const mobileRef = useRef(isMobile);
  const runRef = useRef(0);

  mobileRef.current = isMobile;

  // Only re-render when crossing the mobile breakpoint
  useEffect(() => {
    const onResize = () => setIsMobile(detectMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const releaseAll = useCallback(() => {
    for (const d of decodedRef.current) closeDecoded(d);
    decodedRef.current = [];
    blobsRef.current = [];
    pinnedRef.current = new Set();
    decodingRef.current = new Set();
    queueRef.current = [];
  }, []);

  const decode = useCallback(async (index: number, run: number) => {
    if (decodedRef.current[index] || decodingRef.current.has(index)) return;
    const blob = blobsRef.current[index];
    if (!blob) return;
    decodingRef.current.add(index);
    try {
      const dec = await decodeBlob(blob);
      const { lo, hi } = windowRef.current;
      const stale = runRef.current !== run;
      const outside = !pinnedRef.current.has(index) && (index < lo - EVICT_MARGIN || index > hi + EVICT_MARGIN);
      if (stale || outside) {
        closeDecoded(dec);
        return;
      }
      decodedRef.current[index] = dec;
    } catch {
      // A corrupt frame is skipped; getFrame falls back to the nearest decoded one.
    } finally {
      decodingRef.current.delete(index);
    }
  }, []);

  const pump = useCallback(() => {
    const run = runRef.current;
    while (decodingRef.current.size < DECODE_CONCURRENCY && queueRef.current.length > 0) {
      const next = queueRef.current.shift() as number;
      void decode(next, run).then(() => pump());
    }
  }, [decode]);

  /** Tell the loader where playback is; `direction` > 0 means scrolling forward. */
  const prefetch = useCallback(
    (center: number, direction: number) => {
      const count = blobsRef.current.length;
      if (count === 0) return;
      const ahead = mobileRef.current ? 20 : 28;
      const behind = mobileRef.current ? 6 : 10;
      const lo = Math.max(0, center - (direction < 0 ? ahead : behind));
      const hi = Math.min(count - 1, center + (direction < 0 ? behind : ahead));
      windowRef.current = { lo, hi };

      const decoded = decodedRef.current;
      for (let i = 0; i < decoded.length; i++) {
        const d = decoded[i];
        if (d && !pinnedRef.current.has(i) && (i < lo - EVICT_MARGIN || i > hi + EVICT_MARGIN)) {
          closeDecoded(d);
          decoded[i] = null;
        }
      }

      const queue: number[] = [];
      for (let i = lo; i <= hi; i++) {
        if (blobsRef.current[i] && !decoded[i] && !decodingRef.current.has(i)) queue.push(i);
      }
      queue.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
      queueRef.current = queue;
      pump();
    },
    [pump],
  );

  useEffect(() => {
    const run = ++runRef.current;
    const alive = () => runRef.current === run;
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

    releaseAll();
    setReady(false);
    setLoadProgress(0);

    void (async () => {
      let data: FilmManifest;
      try {
        const res = await fetch(`${base}film/manifest.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching manifest`);
        data = (await res.json()) as FilmManifest;
      } catch (err) {
        console.warn('[useFrameLoader] Failed to load film manifest:', err);
        return;
      }

      // Optional calibrated monitor corners written by the /calibrate page
      try {
        const res = await fetch(`${base}film/screens.json`);
        if (res.ok) {
          const screens: unknown = await res.json();
          if (isScreenQuads(screens)) data = { ...data, screens };
        }
      } catch {
        // No calibration file: the built-in defaults are used.
      }
      if (!alive()) return;

      const pattern = isMobile ? data.mobile.pattern : data.desktop.pattern;
      const urlFor = (i: number) => `${base}${pattern.replace('%04d', String(i).padStart(4, '0'))}`;

      blobsRef.current = new Array(data.count).fill(null);
      decodedRef.current = new Array(data.count).fill(null);
      setManifest(data);

      let loaded = 0;
      const fetchFrame = async (i: number) => {
        if (!alive() || blobsRef.current[i]) return;
        try {
          const res = await fetch(urlFor(i));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          if (!alive()) return;
          blobsRef.current[i] = blob;
          const { lo, hi } = windowRef.current;
          if (i >= lo && i <= hi && !decodedRef.current[i]) {
            queueRef.current.push(i);
            pump();
          }
        } catch {
          // Missing frame: playback falls back to the nearest loaded one.
        }
        loaded++;
        if (loaded % 8 === 0 || loaded === data.count) setLoadProgress(Math.min(1, loaded / data.count));
      };

      // Stage 1: the poster and the final workstation frame, decoded and pinned, so the page can show something at once.
      const first = 0;
      const last = data.count - 1;
      await Promise.all([fetchFrame(first), fetchFrame(last)]);
      if (!alive()) return;
      pinnedRef.current = new Set([first, last]);
      await Promise.all([decode(first, run), decode(last, run)]);
      if (!alive()) return;
      windowRef.current = { lo: 0, hi: mobileRef.current ? 20 : 28 };
      setReady(true);

      // Stage 2: coarse-to-fine, so any scroll position has a nearby frame quickly (every 8th, then 4th, then the rest).
      const order: number[] = [];
      const seen = new Set<number>([first, last]);
      for (const step of [8, 4, 1]) {
        for (let i = 0; i < data.count; i += step) {
          if (!seen.has(i)) {
            seen.add(i);
            order.push(i);
          }
        }
      }
      let cursor = 0;
      const worker = async () => {
        while (alive() && cursor < order.length) {
          const i = order[cursor++];
          await fetchFrame(i);
        }
      };
      await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker));
    })();

    return () => {
      runRef.current++;
    };
  }, [isMobile, releaseAll, decode, pump]);

  // Free decoded frames when the page unmounts
  useEffect(
    () => () => {
      runRef.current++;
      releaseAll();
    },
    [releaseAll],
  );

  /** The exact decoded frame, or null when it is not in the window yet. */
  const getFrameExact = useCallback((index: number): Decoded | null => decodedRef.current[index] ?? null, []);

  /** The decoded frame, or the nearest decoded one while the window is still filling. */
  const getFrame = useCallback((index: number): Decoded | null => {
    const list = decodedRef.current;
    if (list.length === 0) return null;
    const clamped = Math.max(0, Math.min(list.length - 1, Math.round(index)));
    if (list[clamped]) return list[clamped];
    for (let offset = 1; offset < list.length; offset++) {
      if (clamped - offset >= 0 && list[clamped - offset]) return list[clamped - offset];
      if (clamped + offset < list.length && list[clamped + offset]) return list[clamped + offset];
    }
    return null;
  }, []);

  return {
    manifest,
    ready,
    loadProgress,
    getFrame,
    getFrameExact,
    prefetch,
    totalFrames: manifest?.count || 0,
    isMobile,
  };
}

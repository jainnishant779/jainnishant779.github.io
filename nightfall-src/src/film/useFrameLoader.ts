import { useState, useEffect, useRef, useCallback } from 'react';
import type { Quad } from './quad';

export interface FilmSegment {
  id: string;
  start: number;
  end: number;
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
}

export function useFrameLoader() {
  const [manifest, setManifest] = useState<FilmManifest | null>(null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const framesRef = useRef<(ImageBitmap | HTMLImageElement | null)[]>([]);
  const manifestRef = useRef<FilmManifest | null>(null);
  const abortedRef = useRef(false);

  // Check device tier
  useEffect(() => {
    const checkMobile = () => {
      const mob = window.innerWidth <= 960 || ('ontouchstart' in window && window.innerWidth <= 1024);
      setIsMobile(mob);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch manifest
  useEffect(() => {
    abortedRef.current = false;
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    const manifestUrl = `${base}film/manifest.json`;

    fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching manifest`);
        return res.json() as Promise<FilmManifest>;
      })
      .then((data) => {
        if (abortedRef.current) return;
        manifestRef.current = data;
        setManifest(data);
        framesRef.current = new Array(data.count).fill(null);
        startStagedLoading(data, isMobile);
      })
      .catch((err) => {
        console.warn('[useFrameLoader] Failed to load film manifest:', err);
      });

    return () => {
      abortedRef.current = true;
    };
  }, [isMobile]);

  // Staged loading helper
  const startStagedLoading = async (data: FilmManifest, mobile: boolean) => {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    const pattern = mobile ? data.mobile.pattern : data.desktop.pattern;

    const getUrl = (index: number) => {
      const num = String(index).padStart(4, '0');
      const rel = pattern.replace('%04d', num);
      return `${base}${rel}`;
    };

    const loadSingleFrame = async (index: number): Promise<ImageBitmap | HTMLImageElement | null> => {
      if (framesRef.current[index]) return framesRef.current[index];
      const url = getUrl(index);

      try {
        if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const bmp = await createImageBitmap(blob);
          if (!abortedRef.current) {
            framesRef.current[index] = bmp;
          }
          return bmp;
        }
      } catch {
        // Fallback to Image element
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!abortedRef.current) {
            framesRef.current[index] = img;
          }
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    // Stage 1: Load Poster (frame 0) and Workstation Terminal (final frame) immediately
    await Promise.all([loadSingleFrame(0), loadSingleFrame(data.count - 1)]);
    if (abortedRef.current) return;
    setReady(true);
    setLoadProgress(2 / data.count);

    // Stage 2: Load every 8th frame
    const stage2Indices: number[] = [];
    for (let i = 8; i < data.count; i += 8) {
      stage2Indices.push(i);
    }
    // Also include final frame for screen preview readiness
    if (!stage2Indices.includes(data.count - 1)) {
      stage2Indices.push(data.count - 1);
    }

    let loadedCount = 1;
    for (const idx of stage2Indices) {
      if (abortedRef.current) return;
      await loadSingleFrame(idx);
      loadedCount++;
      setLoadProgress(loadedCount / data.count);
    }

    // Stage 3: Load every 4th frame
    const stage3Indices: number[] = [];
    for (let i = 4; i < data.count; i += 4) {
      if (!framesRef.current[i]) {
        stage3Indices.push(i);
      }
    }
    for (const idx of stage3Indices) {
      if (abortedRef.current) return;
      await loadSingleFrame(idx);
      loadedCount++;
      setLoadProgress(loadedCount / data.count);
    }

    // Stage 4: Load remaining frames in small batches
    const remainingIndices: number[] = [];
    for (let i = 0; i < data.count; i++) {
      if (!framesRef.current[i]) {
        remainingIndices.push(i);
      }
    }

    const batchSize = 6;
    for (let i = 0; i < remainingIndices.length; i += batchSize) {
      if (abortedRef.current) return;
      const batch = remainingIndices.slice(i, i + batchSize);
      await Promise.all(batch.map((idx) => loadSingleFrame(idx)));
      loadedCount += batch.length;
      setLoadProgress(Math.min(1, loadedCount / data.count));
      // Small pause to yield main thread
      await new Promise((r) => setTimeout(r, 8));
    }
  };

  // Safe frame getter with outwards fallback
  const getFrame = useCallback((index: number): ImageBitmap | HTMLImageElement | null => {
    const list = framesRef.current;
    if (list.length === 0) return null;

    const clamped = Math.max(0, Math.min(list.length - 1, Math.round(index)));
    if (list[clamped]) return list[clamped];

    // Search outwards for nearest available frame
    for (let offset = 1; offset < list.length; offset++) {
      if (clamped - offset >= 0 && list[clamped - offset]) {
        return list[clamped - offset];
      }
      if (clamped + offset < list.length && list[clamped + offset]) {
        return list[clamped + offset];
      }
    }

    return list[0] || null;
  }, []);

  return {
    manifest,
    ready,
    loadProgress,
    getFrame,
    totalFrames: manifest?.count || 0,
    isMobile,
  };
}

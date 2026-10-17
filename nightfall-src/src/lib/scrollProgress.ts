/**
 * Computes normalised scroll progress 0..1 from window scroll position
 */
export function getRawScrollProgress(): number {
  if (typeof window === 'undefined') return 0;
  const scrollEl = document.scrollingElement || document.documentElement || document.body;
  const totalHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    scrollEl.scrollHeight
  );
  const scrollHeight = totalHeight - window.innerHeight;
  if (scrollHeight <= 0) return 0;
  const currentY = window.scrollY || window.pageYOffset || scrollEl.scrollTop || 0;
  const p = currentY / scrollHeight;
  return Math.max(0, Math.min(1, p));
}

/**
 * Linear interpolation helper
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

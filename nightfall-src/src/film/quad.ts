export type Point = [number, number];
export type Quad = [Point, Point, Point, Point]; // [top-left, top-right, bottom-right, bottom-left]

/**
 * Computes a CSS matrix3d projective transform (homography)
 * that maps a rectangle [0, srcW] x [0, srcH] into an arbitrary convex quad:
 * [p0 (top-left), p1 (top-right), p2 (bottom-right), p3 (bottom-left)].
 *
 * Uses Heckbert's square-to-quad projective mapping with rectangular normalization.
 */
export function getQuadMatrix3d(srcW: number, srcH: number, quad: Quad): string {
  const [p0, p1, p2, p3] = quad;
  const [x0, y0] = p0;
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;

  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const sx = x0 - x1 + x2 - x3;

  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const sy = y0 - y1 + y2 - y3;

  let a11: number;
  let a12: number;
  let a13: number;
  let a21: number;
  let a22: number;
  let a23: number;
  let a31: number;
  let a32: number;

  // Check if mapping is purely affine
  if (Math.abs(sx) < 1e-7 && Math.abs(sy) < 1e-7) {
    a11 = x1 - x0;
    a12 = x3 - x0;
    a13 = x0;
    a21 = y1 - y0;
    a22 = y3 - y0;
    a23 = y0;
    a31 = 0;
    a32 = 0;
  } else {
    const det = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(det) < 1e-8) {
      // Degenerate case fallback: simple scale and translate
      return `matrix3d(1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  ${x0}, ${y0}, 0, 1)`;
    }
    a31 = (sx * dy2 - sy * dx2) / det;
    a32 = (dx1 * sy - dy1 * sx) / det;
    a11 = x1 - x0 + a31 * x1;
    a12 = x3 - x0 + a32 * x3;
    a13 = x0;
    a21 = y1 - y0 + a31 * y1;
    a22 = y3 - y0 + a32 * y3;
    a23 = y0;
  }

  // Normalize by source rectangle dimensions
  const h00 = a11 / srcW;
  const h01 = a12 / srcH;
  const h02 = a13;

  const h10 = a21 / srcW;
  const h11 = a22 / srcH;
  const h12 = a23;

  const h20 = a31 / srcW;
  const h21 = a32 / srcH;
  const h22 = 1.0;

  // Format as CSS column-major 4x4 matrix3d:
  // matrix3d(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44)
  const values = [
    h00.toFixed(9),
    h10.toFixed(9),
    '0',
    h20.toFixed(9),
    h01.toFixed(9),
    h11.toFixed(9),
    '0',
    h21.toFixed(9),
    '0',
    '0',
    '1',
    '0',
    h02.toFixed(3),
    h12.toFixed(3),
    '0',
    h22.toFixed(1),
  ];

  return `matrix3d(${values.join(', ')})`;
}

/**
 * Calculates current quad in viewport CSS pixels given the cover-fit geometry of the canvas.
 */
export function getCoverQuadInViewport(
  rawQuad: Quad,
  nativeW: number,
  nativeH: number,
  viewW: number,
  viewH: number
): Quad {
  const scale = Math.max(viewW / nativeW, viewH / nativeH);
  const offsetX = (viewW - nativeW * scale) / 2;
  const offsetY = (viewH - nativeH * scale) / 2;

  return rawQuad.map(([x, y]) => [
    x * scale + offsetX,
    y * scale + offsetY,
  ]) as Quad;
}

/**
 * WebGL2 support detection utility
 */
export function isWebGL2Available(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGL2RenderingContext &&
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false })
    );
  } catch {
    return false;
  }
}

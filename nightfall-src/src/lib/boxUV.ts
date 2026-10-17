import * as THREE from 'three';

/**
 * Applies triplanar / box-projection UV coordinates to a BufferGeometry
 * based on vertex world coordinates and normals.
 *
 * @param geometry Target BufferGeometry
 * @param repeatPerMetre Texture repeats per metre (default 0.25)
 */
export function applyBoxUV(
  geometry: THREE.BufferGeometry,
  repeatPerMetre = 0.25
): THREE.BufferGeometry {
  const posAttr = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');

  if (!posAttr || !normalAttr) return geometry;

  const count = posAttr.count;
  const uvs = new Float32Array(count * 2);

  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    p.fromBufferAttribute(posAttr, i);
    n.fromBufferAttribute(normalAttr, i);

    const absX = Math.abs(n.x);
    const absY = Math.abs(n.y);
    const absZ = Math.abs(n.z);

    let u = 0;
    let v = 0;

    if (absX >= absY && absX >= absZ) {
      // Projected on YZ plane
      u = p.z * repeatPerMetre;
      v = p.y * repeatPerMetre;
    } else if (absY >= absX && absY >= absZ) {
      // Projected on XZ plane
      u = p.x * repeatPerMetre;
      v = p.z * repeatPerMetre;
    } else {
      // Projected on XY plane
      u = p.x * repeatPerMetre;
      v = p.y * repeatPerMetre;
    }

    uvs[i * 2 + 0] = u;
    uvs[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

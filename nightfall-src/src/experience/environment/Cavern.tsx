import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { CAVERN } from '../../world/layout';
import { usePBR } from '../../lib/assets';
import { applyBoxUV } from '../../lib/boxUV';

export const Cavern: React.FC = () => {
  const rockPBR = usePBR('rock');

  // 1. Procedurally Displaced Cavern Shell (Inverted Ellipsoid with 3-octave simplex noise)
  const cavernGeometry = useMemo(() => {
    // 160 segments along width, 96 along height per Phase 4 specification
    const geom = new THREE.SphereGeometry(1, 160, 96);
    const noise3D = createNoise3D();

    // Scale to cavern radii
    geom.scale(CAVERN.radii.x, CAVERN.radii.y, CAVERN.radii.z);

    const pos = geom.getAttribute('position');
    const normal = geom.getAttribute('normal');
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      n.fromBufferAttribute(normal, i);

      // 3-octave simplex noise:
      // Octave 1: amplitude 2.5m (broad rock formations)
      const n1 = noise3D(v.x * 0.035, v.y * 0.035, v.z * 0.035) * 2.5;
      // Octave 2: amplitude 1.0m (medium crags)
      const n2 = noise3D(v.x * 0.08, v.y * 0.08, v.z * 0.08) * 1.0;
      // Octave 3: amplitude 0.4m (fine surface detail)
      const n3 = noise3D(v.x * 0.22, v.y * 0.22, v.z * 0.22) * 0.4;

      const totalDisp = n1 + n2 + n3;
      v.addScaledVector(n, totalDisp);

      // Flatten floor region (y < -3 in world relative coordinates) toward water/floor level
      if (v.y < -3) {
        v.y = -3 + (v.y + 3) * 0.2;
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geom.computeVertexNormals();
    applyBoxUV(geom, 0.25);
    return geom;
  }, []);

  // 2. Instanced Displaced Boulders (50 boulders away from walkways)
  const { boulderMatrices, boulderGeom } = useMemo(() => {
    const geom = new THREE.IcosahedronGeometry(1.2, 1);
    const noise3D = createNoise3D();
    const pos = geom.getAttribute('position');
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const disp = noise3D(v.x * 0.8, v.y * 0.8, v.z * 0.8) * 0.35;
      v.multiplyScalar(1 + disp);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geom.computeVertexNormals();

    const count = 50;
    const matrices: THREE.Matrix4[] = [];
    const mat = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    // Simple seeded RNG for deterministic placement
    let seed = 42;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    let placed = 0;
    while (placed < count) {
      const angle = rng() * Math.PI * 2;
      const radius = 10 + rng() * (CAVERN.radii.x - 14);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * (radius * 0.8);

      // Keep away from central walkway (|x| > 3.5)
      if (Math.abs(x) > 3.5) {
        const y = -CAVERN.radii.y + 4 + rng() * 1.5;
        position.set(x, y, z);
        rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        quaternion.setFromEuler(rotation);
        const s = 0.6 + rng() * 1.2;
        scale.set(s, s * (0.8 + rng() * 0.4), s);
        mat.compose(position, quaternion, scale);
        matrices.push(mat.clone());
        placed++;
      }
    }

    return { boulderMatrices: matrices, boulderGeom: geom };
  }, []);

  // 3. Instanced Stalactites hanging from cavern ceiling (70 cones)
  const { stalactiteMatrices, stalactiteGeom } = useMemo(() => {
    const geom = new THREE.ConeGeometry(0.4, 3.2, 7);
    const count = 70;
    const matrices: THREE.Matrix4[] = [];
    const mat = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    let seed = 101;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    let placed = 0;
    while (placed < count) {
      const angle = rng() * Math.PI * 2;
      const radius = 6 + rng() * (CAVERN.radii.x - 10);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * (radius * 0.8);

      // Avoid central walkway ceiling
      if (Math.abs(x) > 3.0) {
        const y = CAVERN.radii.y - 3 - rng() * 4;
        position.set(x, y, z);
        // Pointing down: rotation.x = Math.PI with minor tilt
        rotation.set(Math.PI + (rng() - 0.5) * 0.15, 0, (rng() - 0.5) * 0.15);
        quaternion.setFromEuler(rotation);
        const s = 0.7 + rng() * 0.9;
        scale.set(s, s * (0.8 + rng() * 0.6), s);
        mat.compose(position, quaternion, scale);
        matrices.push(mat.clone());
        placed++;
      }
    }

    return { stalactiteMatrices: matrices, stalactiteGeom: geom };
  }, []);

  return (
    <group name="main-cavern" position={[CAVERN.centre.x, CAVERN.centre.y, CAVERN.centre.z]}>
      {/* Massive Displaced Cavern Shell */}
      <mesh geometry={cavernGeometry} receiveShadow>
        <meshStandardMaterial
          color="#16181d"
          roughness={0.9}
          metalness={0.12}
          side={THREE.BackSide}
          map={rockPBR.map || undefined}
          normalMap={rockPBR.normalMap || undefined}
          roughnessMap={rockPBR.roughnessMap || undefined}
        />
      </mesh>

      {/* Instanced Boulders along Cavern Floor */}
      <instancedMesh
        args={[boulderGeom, undefined, boulderMatrices.length]}
        receiveShadow
        castShadow
        ref={(inst) => {
          if (inst) {
            boulderMatrices.forEach((m, idx) => inst.setMatrixAt(idx, m));
            inst.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial
          color="#181a1f"
          roughness={0.88}
          metalness={0.15}
          map={rockPBR.map || undefined}
          normalMap={rockPBR.normalMap || undefined}
        />
      </instancedMesh>

      {/* Instanced Stalactites from Cavern Ceiling */}
      <instancedMesh
        args={[stalactiteGeom, undefined, stalactiteMatrices.length]}
        receiveShadow
        castShadow
        ref={(inst) => {
          if (inst) {
            stalactiteMatrices.forEach((m, idx) => inst.setMatrixAt(idx, m));
            inst.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial
          color="#1a1d22"
          roughness={0.85}
          metalness={0.18}
          map={rockPBR.map || undefined}
          normalMap={rockPBR.normalMap || undefined}
        />
      </instancedMesh>
    </group>
  );
};

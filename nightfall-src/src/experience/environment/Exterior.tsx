import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { createNoise3D } from 'simplex-noise';
import { useStore } from '../../state/store';
import { usePBR } from '../../lib/assets';

import { prefersReducedMotion } from '../../lib/reducedMotion';

export const Exterior: React.FC = () => {
  const tier = useStore((state) => state.tier);
  const rockPBR = usePBR('rock');

  // Displaced cliff face around the portal
  const cliffGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(64, 32, 48, 24);
    const noise3D = createNoise3D();
    const pos = geom.getAttribute('position');
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Only displace if outside the central portal opening (|x| > 6 or y > 9)
      const distToPortal = Math.sqrt(v.x * v.x + (v.y - 4) * (v.y - 4));
      if (distToPortal > 7) {
        const d = noise3D(v.x * 0.08, v.y * 0.08, 0) * 3.5;
        v.z += d;
      }
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Phase 8: Dispose procedural cliff geometry on unmount
  useEffect(() => {
    return () => {
      cliffGeometry.dispose();
    };
  }, [cliffGeometry]);

  // Rain streak count: Low: 400, Med: 1200, High: 2500
  const rainCount = tier === 'high' ? 2500 : tier === 'medium' ? 1200 : 400;

  const { rainPositions, rainInitialY } = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    const initY = new Float32Array(rainCount);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 44; // x: -22..22
      const y = Math.random() * 24 + 1; // y: 1..25
      initY[i] = y;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.random() * 28 + 2; // z: 2..30 (outside portal)
    }
    return { rainPositions: pos, rainInitialY: initY };
  }, [rainCount]);

  const rainRef = useRef<THREE.Points>(null);

  // Fast procedural rain fall animation (scaled by 0.3 under reduced motion)
  useFrame((state) => {
    if (!rainRef.current) return;
    const posAttr = rainRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const baseSpeed = prefersReducedMotion() ? 8.4 : 28; // fall speed scaled by 0.3 under reduced motion
    const time = state.clock.elapsedTime * baseSpeed;

    for (let i = 0; i < rainCount; i++) {
      // Wrap smoothly around 0..24
      const y = ((rainInitialY[i] - time) % 24 + 24) % 24;
      arr[i * 3 + 1] = y;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group name="exterior-zone">
      {/* Volumetric Depth Fog for Exterior Environment */}
      <fogExp2 attach="fog" args={['#0b0d10', 0.035]} />

      {/* Displaced Cliff Face behind and around the portal frame */}
      <mesh
        geometry={cliffGeometry}
        position={[0, 16, -0.5]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#16191d"
          roughness={0.92}
          metalness={0.15}
          map={rockPBR.map || undefined}
          normalMap={rockPBR.normalMap || undefined}
        />
      </mesh>

      {/* Exterior Wet Ground Plane (z > 0) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 20]}
        receiveShadow
      >
        <planeGeometry args={[64, 44]} />
        {tier === 'high' && typeof navigator !== 'undefined' && !navigator.webdriver ? (
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={0.8}
            mixStrength={0.6}
            roughness={0.25}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0f1114"
            metalness={0.3}
            mirror={0.5}
          />
        ) : (
          <meshStandardMaterial
            color="#0e1013"
            roughness={0.18}
            metalness={0.45}
          />
        )}
      </mesh>

      {/* Distant Mountain Silhouettes in the stormy night */}
      <mesh position={[-28, 12, 38]} rotation={[0, 0.4, 0]}>
        <coneGeometry args={[22, 28, 5]} />
        <meshStandardMaterial color="#080a0c" roughness={0.95} />
      </mesh>

      <mesh position={[32, 14, 42]} rotation={[0, -0.3, 0]}>
        <coneGeometry args={[26, 32, 5]} />
        <meshStandardMaterial color="#060709" roughness={0.95} />
      </mesh>

      {/* Instanced Falling Rain Streaks */}
      <points key={`rain-${rainCount}`} ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rainCount}
            array={rainPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#95a5a6"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

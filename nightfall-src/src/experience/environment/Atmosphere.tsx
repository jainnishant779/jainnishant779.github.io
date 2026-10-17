import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../state/store';
import { CAVERN, COMMAND_PLATFORM, SUIT_PLATFORM } from '../../world/layout';

export const Atmosphere: React.FC = () => {
  const tier = useStore((state) => state.tier);
  const dustRef = useRef<THREE.Points>(null);

  // Dust count: Low: 300, Medium: 800, High: 1500
  const dustCount = tier === 'high' ? 1500 : tier === 'medium' ? 800 : 300;

  const dustPositions = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * (CAVERN.radii.x * 1.5);
      pos[i * 3 + 1] = (Math.random() - 0.5) * (CAVERN.radii.y * 1.2) + 4;
      pos[i * 3 + 2] = CAVERN.centre.z + (Math.random() - 0.5) * (CAVERN.radii.z * 1.8);
    }
    return pos;
  }, [dustCount]);

  useFrame((state) => {
    if (dustRef.current) {
      const t = state.clock.elapsedTime;
      dustRef.current.rotation.y = t * 0.015;
      dustRef.current.position.y = Math.sin(t * 0.3) * 0.15;
    }
  });

  return (
    <group name="atmospheric-effects">
      {/* 1. Subtle Additive Light Shaft Cone over Workstation */}
      <mesh
        position={[COMMAND_PLATFORM.centre.x, 4.2, -65]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[2.0, 3.6, 16, 1, true]} />
        <meshBasicMaterial
          color="#ffc575"
          transparent
          opacity={0.025}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Additive Light Shaft Cone under Suit Display Spotlight */}
      <mesh
        position={[SUIT_PLATFORM.centre.x, 3.0, SUIT_PLATFORM.centre.z]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[2.0, 4.5, 16, 1, true]} />
        <meshBasicMaterial
          color="#7fb38a"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Drifting Cavern Dust Points */}
      <points key={`dust-${dustCount}`} ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          color="#e8a23a"
          transparent
          opacity={0.35}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

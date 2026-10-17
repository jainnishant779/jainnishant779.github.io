import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WATER_CHANNEL } from '../../world/layout';
import { usePBR } from '../../lib/assets';

export const Water: React.FC = () => {
  const width = WATER_CHANNEL.maxX - WATER_CHANNEL.minX; // 12m
  const length = Math.abs(WATER_CHANNEL.endZ - WATER_CHANNEL.startZ); // 45m
  const centerX = (WATER_CHANNEL.minX + WATER_CHANNEL.maxX) / 2; // 20
  const centerZ = (WATER_CHANNEL.startZ + WATER_CHANNEL.endZ) / 2; // -52.5
  const waterPBR = usePBR('water');

  const waterMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const waterfallMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const sprayRef = useRef<THREE.Points>(null);

  // 200 spray mist particles at the base of the waterfall
  const sprayCount = 200;
  const { sprayPositions, sprayVelocities } = useMemo(() => {
    const pos = new Float32Array(sprayCount * 3);
    const vel = new Float32Array(sprayCount * 3);
    const sourceX = WATER_CHANNEL.waterfallSource.x;
    const sourceZ = WATER_CHANNEL.waterfallSource.z;
    const baseY = WATER_CHANNEL.waterfallTargetY;

    for (let i = 0; i < sprayCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.2;
      pos[i * 3 + 0] = sourceX + Math.cos(angle) * radius;
      pos[i * 3 + 1] = baseY + Math.random() * 1.5;
      pos[i * 3 + 2] = sourceZ + Math.sin(angle) * radius;

      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = Math.random() * 0.8 + 0.2; // upward spray
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return { sprayPositions: pos, sprayVelocities: vel };
  }, []);

  // Frame update: animate scrolling water normal and spray particles
  useFrame((_, delta) => {
    // 1. Scrolling water normal map
    if (waterMatRef.current && waterMatRef.current.normalMap) {
      waterMatRef.current.normalMap.offset.x = (waterMatRef.current.normalMap.offset.x + delta * 0.03) % 1;
      waterMatRef.current.normalMap.offset.y = (waterMatRef.current.normalMap.offset.y + delta * 0.06) % 1;
    }

    // 2. Waterfall scrolling UV
    if (waterfallMatRef.current && waterfallMatRef.current.map) {
      waterfallMatRef.current.map.offset.y = (waterfallMatRef.current.map.offset.y - delta * 0.8) % 1;
    }

    // 3. Spray particles animation
    if (sprayRef.current) {
      const posAttr = sprayRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const baseY = WATER_CHANNEL.waterfallTargetY;

      for (let i = 0; i < sprayCount; i++) {
        arr[i * 3 + 0] += sprayVelocities[i * 3 + 0] * delta;
        arr[i * 3 + 1] += sprayVelocities[i * 3 + 1] * delta;
        arr[i * 3 + 2] += sprayVelocities[i * 3 + 2] * delta;

        // Reset when too high
        if (arr[i * 3 + 1] > baseY + 2.4) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 1.8;
          arr[i * 3 + 0] = WATER_CHANNEL.waterfallSource.x + Math.cos(angle) * radius;
          arr[i * 3 + 1] = baseY;
          arr[i * 3 + 2] = WATER_CHANNEL.waterfallSource.z + Math.sin(angle) * radius;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="water-basin">
      {/* Subterranean Water Surface Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, WATER_CHANNEL.surfaceY, centerZ]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          ref={waterMatRef}
          color="#061219"
          roughness={0.06}
          metalness={0.9}
          normalMap={waterPBR.normalMap || undefined}
          normalScale={new THREE.Vector2(0.35, 0.35)}
        />
      </mesh>

      {/* Waterfall Vertical Column */}
      <mesh
        position={[
          WATER_CHANNEL.waterfallSource.x,
          (WATER_CHANNEL.waterfallSource.y + WATER_CHANNEL.waterfallTargetY) / 2,
          WATER_CHANNEL.waterfallSource.z,
        ]}
      >
        <cylinderGeometry
          args={[
            1.2,
            1.8,
            WATER_CHANNEL.waterfallSource.y - WATER_CHANNEL.waterfallTargetY,
            16,
            1,
            true,
          ]}
        />
        <meshStandardMaterial
          ref={waterfallMatRef}
          color="#2e4857"
          roughness={0.12}
          metalness={0.5}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* 200 Spray Mist Particles at Waterfall Base */}
      <points ref={sprayRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sprayCount}
            array={sprayPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#c4d5e0"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

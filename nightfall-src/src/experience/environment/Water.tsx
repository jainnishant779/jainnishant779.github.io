import React from 'react';
import { WATER_CHANNEL } from '../../world/layout';

export const Water: React.FC = () => {
  const width = WATER_CHANNEL.maxX - WATER_CHANNEL.minX; // 12m
  const length = Math.abs(WATER_CHANNEL.endZ - WATER_CHANNEL.startZ); // 45m
  const centerX = (WATER_CHANNEL.minX + WATER_CHANNEL.maxX) / 2; // 20
  const centerZ = (WATER_CHANNEL.startZ + WATER_CHANNEL.endZ) / 2; // -52.5

  return (
    <group name="water-basin">
      {/* Dark Subterranean Water Surface Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, WATER_CHANNEL.surfaceY, centerZ]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color="#061219"
          roughness={0.08}
          metalness={0.85}
        />
      </mesh>

      {/* Waterfall Vertical Column from cavern wall */}
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
          ]}
        />
        <meshStandardMaterial
          color="#1e323d"
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

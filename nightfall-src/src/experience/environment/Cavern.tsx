import React from 'react';
import * as THREE from 'three';
import { CAVERN } from '../../world/layout';

export const Cavern: React.FC = () => {
  return (
    <group name="main-cavern" position={[CAVERN.centre.x, CAVERN.centre.y, CAVERN.centre.z]}>
      {/* Massive Cavern Inverted Shell (radii X:34, Y:18, Z:30) */}
      <mesh scale={[CAVERN.radii.x, CAVERN.radii.y, CAVERN.radii.z]} receiveShadow>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial
          color="#0c0e11"
          roughness={0.92}
          metalness={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Cavern Rock Floor Fill below walkway level */}
      <mesh position={[0, -CAVERN.radii.y + 2, 0]} receiveShadow>
        <cylinderGeometry args={[CAVERN.radii.x * 0.85, CAVERN.radii.x * 0.9, 4, 32]} />
        <meshStandardMaterial color="#090a0d" roughness={0.95} />
      </mesh>

      {/* Secondary Rock Pillars & Natural Arch Formations */}
      <mesh position={[-20, 0, 10]} rotation={[0.1, 0.3, -0.05]} receiveShadow>
        <cylinderGeometry args={[2.5, 4.5, 26, 12]} />
        <meshStandardMaterial color="#121518" roughness={0.9} />
      </mesh>

      <mesh position={[22, 0, -8]} rotation={[-0.1, -0.2, 0.08]} receiveShadow>
        <cylinderGeometry args={[3, 5, 26, 12]} />
        <meshStandardMaterial color="#101316" roughness={0.9} />
      </mesh>
    </group>
  );
};

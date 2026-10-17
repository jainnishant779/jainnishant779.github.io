import React from 'react';
import { SUIT_PLATFORM, SUIT_CASE } from '../../world/layout';

export const SuitDisplay: React.FC = () => {
  return (
    <group
      name="suit-display-pod"
      position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y, SUIT_PLATFORM.centre.z]}
    >
      {/* Heavy Plinth Base (0.4m high) */}
      <mesh position={[0, SUIT_CASE.plinthHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry
          args={[
            SUIT_CASE.dimensions.width + 0.3,
            SUIT_CASE.plinthHeight,
            SUIT_CASE.dimensions.depth + 0.3,
          ]}
        />
        <meshStandardMaterial color="#1a1e23" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Amber Plinth Accent Ring Light */}
      <mesh position={[0, SUIT_CASE.plinthHeight + 0.02, 0]}>
        <cylinderGeometry
          args={[
            SUIT_CASE.dimensions.width * 0.45,
            SUIT_CASE.dimensions.width * 0.45,
            0.02,
            32,
          ]}
        />
        <meshStandardMaterial
          color="#e8a23a"
          emissive="#e8a23a"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Armored Suit Silhouette (Procedural Graybox) facing +X */}
      <group
        position={[0, SUIT_CASE.plinthHeight + 0.95, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        {/* Torso Armor Plate */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.65, 0.28]} />
          <meshStandardMaterial color="#1c2024" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Tactical Helmet */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#14171a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Visor Horizontal Amber Slit */}
        <mesh position={[0, 0.85, 0.14]}>
          <boxGeometry args={[0.18, 0.03, 0.05]} />
          <meshStandardMaterial color="#e8a23a" emissive="#e8a23a" emissiveIntensity={1.5} />
        </mesh>

        {/* Legs / Greaves */}
        <mesh position={[-0.12, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.75, 12]} />
          <meshStandardMaterial color="#181b1e" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0.12, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.75, 12]} />
          <meshStandardMaterial color="#181b1e" metalness={0.8} roughness={0.35} />
        </mesh>

        {/* Arms / Gauntlets */}
        <mesh position={[-0.3, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.65, 12]} />
          <meshStandardMaterial color="#181b1e" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0.3, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.65, 12]} />
          <meshStandardMaterial color="#181b1e" metalness={0.8} roughness={0.35} />
        </mesh>
      </group>

      {/* Glass Display Case Enclosure (1.6 x 2.6 x 1.6) */}
      <mesh
        position={[
          0,
          SUIT_CASE.plinthHeight + SUIT_CASE.dimensions.height / 2,
          0,
        ]}
      >
        <boxGeometry
          args={[
            SUIT_CASE.dimensions.width,
            SUIT_CASE.dimensions.height,
            SUIT_CASE.dimensions.depth,
          ]}
        />
        <meshStandardMaterial
          color="#3a4852"
          roughness={0.05}
          metalness={0.2}
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
};

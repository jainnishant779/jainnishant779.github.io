import React from 'react';
import {
  MAIN_WALKWAY,
  COMMAND_PLATFORM,
  SUIT_PLATFORM,
} from '../../world/layout';

export const Walkways: React.FC = () => {
  const mainWalkwayLength = Math.abs(MAIN_WALKWAY.end.z - MAIN_WALKWAY.start.z); // 35m
  const mainWalkwayCenterZ = (MAIN_WALKWAY.start.z + MAIN_WALKWAY.end.z) / 2; // -37.5

  return (
    <group name="steel-walkways">
      {/* Main Walkway Grating Deck (from z = -20 to -55) */}
      <mesh
        position={[0, MAIN_WALKWAY.startY - 0.1, mainWalkwayCenterZ]}
        receiveShadow
      >
        <boxGeometry args={[MAIN_WALKWAY.width, 0.2, mainWalkwayLength]} />
        <meshStandardMaterial color="#20252b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Main Walkway Side Railings */}
      {/* Left Railing */}
      <mesh position={[-MAIN_WALKWAY.width / 2 + 0.05, MAIN_WALKWAY.startY + 0.5, mainWalkwayCenterZ]}>
        <boxGeometry args={[0.08, 1.0, mainWalkwayLength]} />
        <meshStandardMaterial color="#2d333b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Right Railing */}
      <mesh position={[MAIN_WALKWAY.width / 2 - 0.05, MAIN_WALKWAY.startY + 0.5, mainWalkwayCenterZ]}>
        <boxGeometry args={[0.08, 1.0, mainWalkwayLength]} />
        <meshStandardMaterial color="#2d333b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Side Walkway Branch to Suit Platform (at z = -42, extends from x = 0 to x = -16) */}
      <mesh
        position={[-8, SUIT_PLATFORM.centre.y - 0.1, SUIT_PLATFORM.junctionZ]}
        receiveShadow
      >
        <boxGeometry args={[16, 0.2, 2.5]} />
        <meshStandardMaterial color="#20252b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Suit Platform Raised Deck (5 x 5 at (-16, -1, -42)) */}
      <mesh
        position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y - 0.1, SUIT_PLATFORM.centre.z]}
        receiveShadow
      >
        <boxGeometry args={[SUIT_PLATFORM.deckSize.width, 0.25, SUIT_PLATFORM.deckSize.depth]} />
        <meshStandardMaterial color="#1a1e23" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Stairs Ramp (from y=-1 at z=-55 to y=1 at z=-58, length 3m in Z, 2m in Y) */}
      <mesh
        position={[
          0,
          (COMMAND_PLATFORM.stairStartY + COMMAND_PLATFORM.stairEndY) / 2,
          (COMMAND_PLATFORM.stairStartZ + COMMAND_PLATFORM.stairEndZ) / 2,
        ]}
        rotation={[Math.atan2(2, 3), 0, 0]}
        receiveShadow
      >
        <boxGeometry args={[MAIN_WALKWAY.width, 0.2, Math.sqrt(3 * 3 + 2 * 2)]} />
        <meshStandardMaterial color="#232930" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Command Center Raised Platform Deck (12 x 8 at (0, 1, -62)) */}
      <mesh
        position={[COMMAND_PLATFORM.centre.x, COMMAND_PLATFORM.centre.y - 0.15, COMMAND_PLATFORM.centre.z]}
        receiveShadow
      >
        <boxGeometry args={[COMMAND_PLATFORM.deckSize.width, 0.3, COMMAND_PLATFORM.deckSize.depth]} />
        <meshStandardMaterial color="#1a1e23" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Command Platform Support Columns going down into cavern abyss */}
      {[-5, 5].map((x) =>
        [-59, -65].map((z) => (
          <mesh key={`col-${x}-${z}`} position={[x, -5, z]} receiveShadow>
            <cylinderGeometry args={[0.3, 0.4, 12, 8]} />
            <meshStandardMaterial color="#14171a" metalness={0.9} roughness={0.3} />
          </mesh>
        ))
      )}
    </group>
  );
};

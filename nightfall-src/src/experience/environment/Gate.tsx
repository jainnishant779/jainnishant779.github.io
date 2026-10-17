import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../state/store';
import { GATE, BUNKER_PORTAL } from '../../world/layout';

export const Gate: React.FC = () => {
  const leftLeafRef = useRef<THREE.Mesh>(null);
  const rightLeafRef = useRef<THREE.Mesh>(null);
  const lightMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Compute gate open fraction (0..1) when scroll is between 0.12 and 0.30
  useFrame(() => {
    const progress = useStore.getState().progress;
    let openFraction = 0;
    if (progress >= 0.3) {
      openFraction = 1;
    } else if (progress > 0.12) {
      // Ease in-out interpolation
      const t = (progress - 0.12) / (0.3 - 0.12);
      openFraction = t * t * (3 - 2 * t);
    }

    const slideX = openFraction * GATE.slideDeltaX;

    if (leftLeafRef.current) {
      leftLeafRef.current.position.x = -GATE.opening.width / 4 - slideX;
    }
    if (rightLeafRef.current) {
      rightLeafRef.current.position.x = GATE.opening.width / 4 + slideX;
    }
    if (lightMatRef.current) {
      lightMatRef.current.emissiveIntensity = progress > 0.3 ? 0.3 : 1.5;
    }
  });

  return (
    <group name="gate-bunker-portal" position={[0, 0, 0]}>
      {/* Concrete Portal Outer Frame (12 w x 10 h x 3 d) */}
      {/* Left Column */}
      <mesh position={[-5, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[2, 10, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#22252a" roughness={0.8} />
      </mesh>

      {/* Right Column */}
      <mesh position={[5, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[2, 10, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#22252a" roughness={0.8} />
      </mesh>

      {/* Lintel Beam Overhead */}
      <mesh position={[0, 8.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 3, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#1e2024" roughness={0.8} />
      </mesh>

      {/* Threshold Floor Beam */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[12, 0.4, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#181a1d" roughness={0.6} />
      </mesh>

      {/* Left Sliding Steel Door Leaf */}
      <mesh
        ref={leftLeafRef}
        position={[-GATE.opening.width / 4, GATE.centre.y - 0.5, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[GATE.opening.width / 2, GATE.opening.height, 0.4]} />
        <meshStandardMaterial color="#2d3239" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Right Sliding Steel Door Leaf */}
      <mesh
        ref={rightLeafRef}
        position={[GATE.opening.width / 4, GATE.centre.y - 0.5, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[GATE.opening.width / 2, GATE.opening.height, 0.4]} />
        <meshStandardMaterial color="#2d3239" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Door Status Light Strip above the portal */}
      <mesh position={[0, 7.2, 1.6]}>
        <boxGeometry args={[1.5, 0.15, 0.1]} />
        <meshStandardMaterial
          ref={lightMatRef}
          color="#e8a23a"
          emissive="#e8a23a"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
};

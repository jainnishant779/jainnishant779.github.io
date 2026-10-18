import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TUNNEL } from '../../world/layout';
import { usePBR } from '../../lib/assets';

export const Tunnel: React.FC = () => {
  const tunnelLength = Math.abs(TUNNEL.endZ - TUNNEL.startZ); // 20m
  const centerZ = (TUNNEL.startZ + TUNNEL.endZ) / 2; // -10
  const concretePBR = usePBR('concrete');

  // Overhead industrial pipes running along Z (3 parallel pipes)
  const pipeZLength = tunnelLength;
  const pipeGeom = useMemo(() => new THREE.CylinderGeometry(0.08, 0.08, pipeZLength, 12), [pipeZLength]);

  // Caged overhead lamps positions every 5m
  const lampPositions = [-3, -8, -13, -18];

  return (
    <group name="tunnel-corridor">
      {/* Concrete Left Wall */}
      <mesh position={[-TUNNEL.width / 2, 2.5, centerZ]} receiveShadow castShadow>
        <boxGeometry args={[0.6, TUNNEL.height, tunnelLength]} />
        <meshStandardMaterial
          color="#1e2126"
          roughness={0.88}
          metalness={0.1}
          map={concretePBR.map || undefined}
        />
      </mesh>

      {/* Concrete Right Wall */}
      <mesh position={[TUNNEL.width / 2, 2.5, centerZ]} receiveShadow castShadow>
        <boxGeometry args={[0.6, TUNNEL.height, tunnelLength]} />
        <meshStandardMaterial
          color="#1e2126"
          roughness={0.88}
          metalness={0.1}
          map={concretePBR.map || undefined}
        />
      </mesh>

      {/* Concrete Ceiling */}
      <mesh position={[0, TUNNEL.height - 0.4, centerZ]} receiveShadow>
        <boxGeometry args={[TUNNEL.width, 0.6, tunnelLength]} />
        <meshStandardMaterial
          color="#181a1d"
          roughness={0.92}
          map={concretePBR.map || undefined}
        />
      </mesh>

      {/* Ramped Concrete Floor (sloping from y=0 at z=0 to y=-1 at z=-20) */}
      <mesh
        position={[0, -0.5, centerZ]}
        rotation={[Math.atan2(1, 20), 0, 0]}
        receiveShadow
      >
        <boxGeometry args={[TUNNEL.width, 0.4, Math.sqrt(20 * 20 + 1 * 1)]} />
        <meshStandardMaterial
          color="#1a1c20"
          roughness={0.82}
          metalness={0.15}
          map={concretePBR.map || undefined}
        />
      </mesh>

      {/* Overhead Instanced Industrial Conduits & Pipes */}
      {[-1.2, 0, 1.2].map((xOffset, idx) => (
        <mesh
          key={`pipe-${idx}`}
          geometry={pipeGeom}
          position={[xOffset, TUNNEL.height - 0.9, centerZ]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <meshStandardMaterial
            color="#2a2e36"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Caged Emissive Lamps every 5m along the tunnel */}
      {lampPositions.map((zPos) => (
        <group key={`caged-lamp-${zPos}`} position={[0, TUNNEL.height - 1.0, zPos]}>
          {/* Ceiling Bracket */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshStandardMaterial color="#121417" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Protective Steel Wire Cage */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.45, 8, 1, true]} />
            <meshStandardMaterial
              color="#3a3f4a"
              metalness={0.85}
              roughness={0.3}
              wireframe
            />
          </mesh>

          {/* Emissive Warm Amber Lamp Core */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color="#e8a23a"
              emissive="#e8a23a"
              emissiveIntensity={1.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

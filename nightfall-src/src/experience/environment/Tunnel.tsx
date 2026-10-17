import React from 'react';
import { TUNNEL } from '../../world/layout';

export const Tunnel: React.FC = () => {
  const tunnelLength = Math.abs(TUNNEL.endZ - TUNNEL.startZ); // 20m
  const centerZ = (TUNNEL.startZ + TUNNEL.endZ) / 2; // -10

  return (
    <group name="tunnel-corridor">
      {/* Concrete Left Wall */}
      <mesh position={[-TUNNEL.width / 2, 2.5, centerZ]} receiveShadow>
        <boxGeometry args={[0.5, TUNNEL.height, tunnelLength]} />
        <meshStandardMaterial color="#1a1c1f" roughness={0.85} />
      </mesh>

      {/* Concrete Right Wall */}
      <mesh position={[TUNNEL.width / 2, 2.5, centerZ]} receiveShadow>
        <boxGeometry args={[0.5, TUNNEL.height, tunnelLength]} />
        <meshStandardMaterial color="#1a1c1f" roughness={0.85} />
      </mesh>

      {/* Concrete Ceiling */}
      <mesh position={[0, TUNNEL.height - 0.5, centerZ]} receiveShadow>
        <boxGeometry args={[TUNNEL.width, 0.5, tunnelLength]} />
        <meshStandardMaterial color="#141618" roughness={0.9} />
      </mesh>

      {/* Ramped Floor (sloping from y=0 at z=0 to y=-1 at z=-20) */}
      <mesh
        position={[0, -0.5, centerZ]}
        rotation={[Math.atan2(1, 20), 0, 0]}
        receiveShadow
      >
        <boxGeometry args={[TUNNEL.width, 0.4, Math.sqrt(20 * 20 + 1 * 1)]} />
        <meshStandardMaterial color="#181a1d" roughness={0.7} />
      </mesh>

      {/* Overhead Cable Trays & Industrial Fixtures */}
      {[-4, -9, -14, -19].map((z) => (
        <group key={`fixture-${z}`} position={[0, 4.8, z]}>
          <mesh>
            <boxGeometry args={[TUNNEL.width - 1, 0.15, 0.2]} />
            <meshStandardMaterial color="#111315" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
            <meshStandardMaterial
              color="#e8a23a"
              emissive="#e8a23a"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

import React from 'react';

export const Exterior: React.FC = () => {
  return (
    <group name="exterior-zone">
      {/* Mountain Cliff Face at z = 0 with opening for the portal */}
      <mesh position={[-16, 12, 0]} receiveShadow>
        <boxGeometry args={[20, 24, 2]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
      </mesh>

      <mesh position={[16, 12, 0]} receiveShadow>
        <boxGeometry args={[20, 24, 2]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
      </mesh>

      <mesh position={[0, 20, 0]} receiveShadow>
        <boxGeometry args={[12, 10, 2]} />
        <meshStandardMaterial color="#141618" roughness={0.9} />
      </mesh>

      {/* Exterior Wet Ground Plane (z > 0) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 20]}
        receiveShadow
      >
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#101214" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Distant Mountain Silhouettes */}
      <mesh position={[-25, 10, 35]} rotation={[0, 0.4, 0]}>
        <coneGeometry args={[18, 22, 5]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.95} />
      </mesh>

      <mesh position={[28, 12, 38]} rotation={[0, -0.3, 0]}>
        <coneGeometry args={[22, 26, 5]} />
        <meshStandardMaterial color="#080a0c" roughness={0.95} />
      </mesh>
    </group>
  );
};

import React from 'react';
import { BATCOMPUTER } from '../../world/layout';

export const Batcomputer: React.FC = () => {
  // 5 monitors positioned on an arc
  const monitorAngles = [-0.5, -0.25, 0, 0.25, 0.5]; // radians

  return (
    <group name="batcomputer-workstation" position={[BATCOMPUTER.deskCentre.x, BATCOMPUTER.deskCentre.y, BATCOMPUTER.deskCentre.z]}>
      {/* Heavy Command Desk Surface */}
      <mesh position={[0, 0.45, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.15, 2.2]} />
        <meshStandardMaterial color="#1a1e24" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Desk Base Supports */}
      <mesh position={[-1.7, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.9, 1.8]} />
        <meshStandardMaterial color="#111417" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh position={[1.7, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.9, 1.8]} />
        <meshStandardMaterial color="#111417" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Side Equipment Server Racks */}
      <mesh position={[-2.6, 0.6, -0.3]} receiveShadow castShadow>
        <boxGeometry args={[0.9, 2.2, 1.2]} />
        <meshStandardMaterial color="#0f1215" metalness={0.85} roughness={0.25} />
      </mesh>

      <mesh position={[2.6, 0.6, -0.3]} receiveShadow castShadow>
        <boxGeometry args={[0.9, 2.2, 1.2]} />
        <meshStandardMaterial color="#0f1215" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Arc of 5 Curved Surveillance Monitors */}
      {monitorAngles.map((angle, idx) => {
        const isCenter = idx === 2;
        const radius = BATCOMPUTER.arcRadius;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius + (radius - 1.0);
        const width = isCenter ? BATCOMPUTER.mainScreen.width : 1.1;
        const height = isCenter ? BATCOMPUTER.mainScreen.height : 0.75;
        const y = isCenter ? 1.6 : 1.45;

        return (
          <group
            key={`monitor-${idx}`}
            position={[x, y, z]}
            rotation={[0, -angle, 0]}
          >
            {/* Monitor Bezel */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width + 0.08, height + 0.08, 0.08]} />
              <meshStandardMaterial color="#0d1013" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Monitor Screen Glass / Display */}
            <mesh position={[0, 0, 0.045]}>
              <planeGeometry args={[width, height]} />
              <meshStandardMaterial
                color="#060e12"
                emissive="#e8a23a"
                emissiveIntensity={isCenter ? 0.35 : 0.15}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Operator Console Keyboards & Control Surface */}
      <mesh position={[0, 0.55, 0.4]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.35]} />
        <meshStandardMaterial color="#090c0f" roughness={0.5} />
      </mesh>
    </group>
  );
};

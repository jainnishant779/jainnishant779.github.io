import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SuitDisplay } from '../_legacy3d/objects/SuitDisplay';
import { SUIT_PLATFORM } from './layout';
import { SuitHudCard } from '../ui/SuitHudCard';
import { sound } from '../lib/sound';
import { prefersReducedMotion } from '../lib/reducedMotion';

interface SuitInspectViewProps {
  onReturnToWorkstation: () => void;
  onOpenOS: () => void;
}

export const SuitInspectView: React.FC<SuitInspectViewProps> = ({
  onReturnToWorkstation,
  onOpenOS,
}) => {
  const controlsRef = useRef<any>(null);

  const handleReturn = () => {
    sound.initContext();
    sound.playUiClick();
    onReturnToWorkstation();
  };

  const handleOpenCommand = () => {
    sound.initContext();
    sound.playBootHum();
    onOpenOS();
  };

  return (
    <div
      className="suit-inspect-viewport"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: '#05070a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 3D WebGL Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [2.5, 1.6, 2.5], fov: 48 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          {/* Ambient Cavern Fill */}
          <ambientLight intensity={0.35} color="#0e1720" />

          {/* Key Overhead Emerald/Cyan Spotlight */}
          <spotLight
            position={[2, 5, 2.5]}
            target-position={[0, 1.2, 0]}
            color="#48cae4"
            intensity={90}
            decay={2}
            distance={15}
            angle={Math.PI / 4}
            penumbra={0.6}
            castShadow
          />

          {/* Warm Amber Rim Light from Behind */}
          <spotLight
            position={[-3, 4, -3]}
            target-position={[0, 1.2, 0]}
            color="#e8a23a"
            intensity={65}
            decay={2}
            distance={15}
            angle={Math.PI / 3}
            penumbra={0.7}
          />

          {/* Under-plinth Uplight */}
          <pointLight position={[0, 0.1, 0]} color="#7fb38a" intensity={25} distance={6} decay={2} />

          {/* Cavern Steel Grid Floor Reflection Plate */}
          <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[14, 14]} />
            <meshStandardMaterial color="#0c1015" roughness={0.4} metalness={0.8} />
          </mesh>

          {/* Centered Suit Display Model */}
          <group position={[-SUIT_PLATFORM.centre.x, -SUIT_PLATFORM.centre.y, -SUIT_PLATFORM.centre.z]}>
            <SuitDisplay />
          </group>

          {/* Interactive 360 Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            target={[0, 1.25, 0]}
            minDistance={1.8}
            maxDistance={4.8}
            minPolarAngle={(35 * Math.PI) / 180}
            maxPolarAngle={(92 * Math.PI) / 180}
            enableDamping={!prefersReducedMotion()}
            dampingFactor={0.06}
            rotateSpeed={0.75}
            zoomSpeed={0.8}
            enablePan={false}
          />
        </Canvas>
      </div>

      {/* Top Navigation Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          pointerEvents: 'auto',
          background: 'linear-gradient(180deg, rgba(5, 7, 10, 0.95) 0%, rgba(5, 7, 10, 0) 100%)',
        }}
      >
        <button
          onClick={handleReturn}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.2rem',
            backgroundColor: 'rgba(232, 162, 58, 0.15)',
            border: '1px solid #e8a23a',
            color: '#e8a23a',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.82rem',
            fontWeight: 700,
            borderRadius: '3px',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(232, 162, 58, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(232, 162, 58, 0.35)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(232, 162, 58, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(232, 162, 58, 0.15)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(232, 162, 58, 0.3)';
          }}
        >
          ← RETURN TO WORKSTATION
        </button>

        {/* Tactical Status Pill */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.74rem',
            color: '#7fb38a',
            border: '1px solid rgba(127, 179, 138, 0.4)',
            backgroundColor: 'rgba(10, 16, 12, 0.85)',
            padding: '0.4rem 1.1rem',
            borderRadius: '20px',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backdropFilter: 'blur(6px)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#7fb38a',
              boxShadow: '0 0 8px #7fb38a',
            }}
          />
          CHAMBER 03 // WARDEN EXOSKELETON VAULT [DRAG TO ORBIT 360°]
        </div>

        <button
          onClick={handleOpenCommand}
          style={{
            padding: '0.55rem 1.2rem',
            backgroundColor: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid #00e5ff',
            color: '#00e5ff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.82rem',
            fontWeight: 700,
            borderRadius: '3px',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.35)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 229, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.15)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.3)';
          }}
        >
          ACCESS NJ-OS COMMAND CENTER ↗
        </button>
      </div>

      {/* Exoskeleton HUD Specification Card */}
      <SuitHudCard />

      {/* Bottom Hint Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          color: '#9e9a8e',
          backgroundColor: 'rgba(7, 10, 14, 0.85)',
          border: '1px solid #1e2228',
          padding: '0.4rem 1rem',
          borderRadius: '4px',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
        }}
      >
        Left Click + Drag: Orbit Camera · Scroll Wheel: Zoom · Esc / Button: Return to Workstation
      </div>
    </div>
  );
};

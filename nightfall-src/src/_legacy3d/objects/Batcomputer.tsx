import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BATCOMPUTER } from '../../world/layout';
import { useStore } from '../../state/store';
import { createMonitorCanvases } from './MonitorCanvases';

export const Batcomputer: React.FC = () => {
  const setOsOpen = useStore((state) => state.setOsOpen);

  // Monitor arc angles in radians (5 monitors)
  const monitorAngles = useMemo(() => [-0.52, -0.26, 0, 0.26, 0.52], []);

  // Initialize Canvas Texture Manager
  const canvasManager = useMemo(() => createMonitorCanvases(), []);

  // Clean up canvas textures on unmount
  useEffect(() => {
    return () => {
      canvasManager.dispose();
    };
  }, [canvasManager]);

  // Throttle canvas updates to 10 FPS (every 100ms) to conserve CPU/GPU
  const timeAccumulator = useRef(0);
  useFrame(({ clock }, dt) => {
    timeAccumulator.current += dt;
    if (timeAccumulator.current >= 0.1) {
      canvasManager.update(clock.getElapsedTime());
      timeAccumulator.current = 0;
    }
  });

  // Server rack blinking status LEDs (cycling patterns)
  const ledRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const t = clock.getElapsedTime();
    ledRef.current.children.forEach((child, i) => {
      if ((child as any).material) {
        const mat = (child as any).material as THREE.MeshBasicMaterial;
        const blink = Math.sin(t * 8 + i * 1.5) > 0.2;
        mat.opacity = blink ? 1.0 : 0.2;
      }
    });
  });

  return (
    <group
      name="batcomputer-workstation"
      position={[BATCOMPUTER.deskCentre.x, BATCOMPUTER.deskCentre.y, BATCOMPUTER.deskCentre.z]}
    >
      {/* ============================================================
       * 1. Heavy Industrial Command Desk Structure
       * ============================================================ */}

      {/* Main Curved Desktop Surface (Multi-segmented chamfered deck) */}
      <mesh position={[0, 0.45, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.14, 2.2]} />
        <meshStandardMaterial color="#16191e" metalness={0.78} roughness={0.32} />
      </mesh>

      {/* Front Beveled Edge Bumper */}
      <mesh position={[0, 0.43, 1.12]} rotation={[0.3, 0, 0]} receiveShadow>
        <boxGeometry args={[4.42, 0.1, 0.08]} />
        <meshStandardMaterial color="#1f242c" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Heavy Steel Pedestal Legs */}
      <mesh position={[-1.8, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.9, 1.9]} />
        <meshStandardMaterial color="#0f1216" metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh position={[1.8, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.9, 1.9]} />
        <meshStandardMaterial color="#0f1216" metalness={0.88} roughness={0.28} />
      </mesh>
      {/* Central Under-Desk Reinforcing Crossbeam */}
      <mesh position={[0, 0.15, -0.2]} receiveShadow>
        <boxGeometry args={[3.4, 0.12, 0.3]} />
        <meshStandardMaterial color="#14171c" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* ============================================================
       * 2. Flanking Server Racks with Blinking Telemetry LEDs
       * ============================================================ */}

      {/* Left Server Tower */}
      <group position={[-2.8, 0.75, -0.3]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.0, 2.4, 1.4]} />
          <meshStandardMaterial color="#0d1013" metalness={0.85} roughness={0.28} />
        </mesh>
        {/* Front Perforated Grille */}
        <mesh position={[0, 0, 0.71]}>
          <planeGeometry args={[0.85, 2.2]} />
          <meshStandardMaterial color="#090b0e" metalness={0.9} roughness={0.4} />
        </mesh>
        {/* Unit Bay Dividers */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((y, idx) => (
          <mesh key={`rack-left-${idx}`} position={[0, y, 0.715]}>
            <boxGeometry args={[0.88, 0.04, 0.03]} />
            <meshStandardMaterial color="#1c222a" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Right Server Tower */}
      <group position={[2.8, 0.75, -0.3]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.0, 2.4, 1.4]} />
          <meshStandardMaterial color="#0d1013" metalness={0.85} roughness={0.28} />
        </mesh>
        {/* Front Perforated Grille */}
        <mesh position={[0, 0, 0.71]}>
          <planeGeometry args={[0.85, 2.2]} />
          <meshStandardMaterial color="#090b0e" metalness={0.9} roughness={0.4} />
        </mesh>
        {/* Unit Bay Dividers */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((y, idx) => (
          <mesh key={`rack-right-${idx}`} position={[0, y, 0.715]}>
            <boxGeometry args={[0.88, 0.04, 0.03]} />
            <meshStandardMaterial color="#1c222a" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Blinking Rack Indicator LEDs */}
      <group ref={ledRef}>
        {[-0.7, -0.3, 0.1, 0.5, 0.9].map((y, idx) => (
          <React.Fragment key={`led-grp-${idx}`}>
            {/* Left rack LEDs */}
            <mesh position={[-2.45, 0.75 + y, 0.42]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#7fb38a' : '#e8a23a'} transparent />
            </mesh>
            <mesh position={[-2.52, 0.75 + y, 0.42]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color={idx === 1 ? '#cf5656' : '#7fb38a'} transparent />
            </mesh>
            {/* Right rack LEDs */}
            <mesh position={[2.45, 0.75 + y, 0.42]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshBasicMaterial color={idx % 2 === 1 ? '#7fb38a' : '#e8a23a'} transparent />
            </mesh>
            <mesh position={[2.52, 0.75 + y, 0.42]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color={idx === 3 ? '#cf5656' : '#7fb38a'} transparent />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* ============================================================
       * 3. Heavy Braided Cable Conduits
       * ============================================================ */}

      {/* Left Conduit Bundle curling down to grating floor */}
      <mesh position={[-2.2, 0.0, -0.2]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.065, 0.075, 1.2, 10]} />
        <meshStandardMaterial color="#0c0e11" roughness={0.7} />
      </mesh>
      <mesh position={[-2.1, -0.3, -0.4]} rotation={[0.4, 0, -0.15]}>
        <cylinderGeometry args={[0.055, 0.065, 0.9, 10]} />
        <meshStandardMaterial color="#090a0c" roughness={0.75} />
      </mesh>

      {/* Right Conduit Bundle */}
      <mesh position={[2.2, 0.0, -0.2]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.065, 0.075, 1.2, 10]} />
        <meshStandardMaterial color="#0c0e11" roughness={0.7} />
      </mesh>
      <mesh position={[2.1, -0.3, -0.4]} rotation={[0.4, 0, 0.15]}>
        <cylinderGeometry args={[0.055, 0.065, 0.9, 10]} />
        <meshStandardMaterial color="#090a0c" roughness={0.75} />
      </mesh>

      {/* ============================================================
       * 4. Rear Monitor Articulation Gantry & Mounting Arms
       * ============================================================ */}

      {/* Heavy Steel Support Posts */}
      <mesh position={[-1.2, 1.2, -1.05]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 1.5, 12]} />
        <meshStandardMaterial color="#1a1e24" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.2, 1.2, -1.05]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 1.5, 12]} />
        <meshStandardMaterial color="#1a1e24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Curved Horizontal Crossbar */}
      <mesh position={[0, 1.6, -1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 4.2, 12]} />
        <meshStandardMaterial color="#222830" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ============================================================
       * 5. 5-Monitor Arc Layout with Live CanvasTextures
       * ============================================================ */}

      {monitorAngles.map((angle, idx) => {
        const isCenter = idx === 2;
        const radius = BATCOMPUTER.arcRadius;

        // Position on circle radius 2.2m centered such that center monitor is at z = -1.0
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius + (radius - 1.0);
        const y = isCenter ? 1.6 : 1.55;
        const width = isCenter ? BATCOMPUTER.mainScreen.width : 1.1;
        const height = isCenter ? BATCOMPUTER.mainScreen.height : 0.75;

        return (
          <group
            key={`monitor-${idx}`}
            position={[x, y, z]}
            rotation={[0, -angle, 0]}
          >
            {/* Monitor Mounting Arm Bracket */}
            <mesh position={[0, 0, -0.06]}>
              <boxGeometry args={[0.2, 0.2, 0.08]} />
              <meshStandardMaterial color="#1c2027" metalness={0.85} roughness={0.25} />
            </mesh>

            {/* Monitor Bezel Frame (Chamfered Industrial Bezel) */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width + 0.08, height + 0.08, 0.06]} />
              <meshStandardMaterial color="#0c0e12" metalness={0.82} roughness={0.3} />
            </mesh>

            {/* Monitor Bezel Manufacturer Badge (bottom center of bezel) */}
            <mesh position={[0, -height / 2 - 0.022, 0.032]}>
              <boxGeometry args={[0.18, 0.018, 0.005]} />
              <meshBasicMaterial color="#e8a23a" />
            </mesh>

            {/* Power Status LED on Bezel (bottom right) */}
            <mesh position={[width / 2 + 0.015, -height / 2 - 0.02, 0.032]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color={isCenter ? '#e8a23a' : '#7fb38a'} />
            </mesh>

            {/* Animated CRT Display Screen Glass (CanvasTexture) */}
            <mesh
              position={[0, 0, 0.032]}
              onClick={isCenter ? () => setOsOpen(true) : undefined}
              onPointerOver={
                isCenter
                  ? () => {
                      document.body.style.cursor = 'pointer';
                    }
                  : undefined
              }
              onPointerOut={
                isCenter
                  ? () => {
                      document.body.style.cursor = 'default';
                    }
                  : undefined
              }
            >
              <planeGeometry args={[width, height]} />
              <meshBasicMaterial
                map={canvasManager.textures[idx]}
                toneMapped={false}
              />
            </mesh>

            {/* Subtle Emissive Glass Reflection Layer */}
            <mesh position={[0, 0, 0.033]}>
              <planeGeometry args={[width, height]} />
              <meshStandardMaterial
                color="#e8a23a"
                roughness={0.1}
                metalness={0.2}
                transparent
                opacity={0.08}
              />
            </mesh>
          </group>
        );
      })}

      {/* ============================================================
       * 6. Operator Console Keyboards, Trackpad, and Cyber Deck
       * ============================================================ */}

      {/* Center Console Slanted Deck */}
      <group position={[0, 0.52, 0.42]} rotation={[-0.18, 0, 0]}>
        {/* Keyboard Tray Base */}
        <mesh receiveShadow>
          <boxGeometry args={[1.5, 0.035, 0.45]} />
          <meshStandardMaterial color="#0c0e12" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Mechanical Key Block */}
        <mesh position={[-0.2, 0.025, 0]}>
          <boxGeometry args={[0.85, 0.02, 0.35]} />
          <meshStandardMaterial color="#161a20" roughness={0.4} />
        </mesh>

        {/* Illuminated Key Backlight Strip */}
        <mesh position={[-0.2, 0.036, 0]}>
          <planeGeometry args={[0.82, 0.32]} />
          <meshBasicMaterial color="#e8a23a" transparent opacity={0.35} />
        </mesh>

        {/* Touchpad / Cybernetic Interface Surface */}
        <mesh position={[0.42, 0.025, 0]}>
          <boxGeometry args={[0.3, 0.015, 0.32]} />
          <meshStandardMaterial color="#0e1217" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.42, 0.033, 0]}>
          <planeGeometry args={[0.26, 0.28]} />
          <meshBasicMaterial color="#7fb38a" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Left Diagnostic Control Pad */}
      <group position={[-1.2, 0.51, 0.35]} rotation={[-0.14, 0.15, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.65, 0.03, 0.4]} />
          <meshStandardMaterial color="#0e1115" metalness={0.75} roughness={0.35} />
        </mesh>
        {/* Analog-style status dials */}
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={`dial-left-${i}`} position={[x, 0.02, -0.06]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 12]} />
            <meshStandardMaterial color="#1a2028" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Right Telemetry Control Pad */}
      <group position={[1.2, 0.51, 0.35]} rotation={[-0.14, -0.15, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.65, 0.03, 0.4]} />
          <meshStandardMaterial color="#0e1115" metalness={0.75} roughness={0.35} />
        </mesh>
        {/* Toggle switches and indicator block */}
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={`dial-right-${i}`} position={[x, 0.02, -0.06]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 12]} />
            <meshStandardMaterial color="#1a2028" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ============================================================
       * 7. Workstation Lighting
       * ============================================================ */}

      {/* Under-Desk Warm Amber Ambient LED Strip casting down on steel deck */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[3.8, 0.02, 0.05]} />
        <meshBasicMaterial color="#e8a23a" />
      </mesh>
    </group>
  );
};

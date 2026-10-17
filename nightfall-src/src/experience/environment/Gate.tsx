import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { useStore } from '../../state/store';
import { GATE, BUNKER_PORTAL } from '../../world/layout';
import { sound } from '../../lib/sound';

interface GateAnimationState {
  panelGlow: number;
  lampColorR: number;
  lampColorG: number;
  lampColorB: number;
  lampIntensity: number;
  lockBarRetract: number;
  leafSlide: number;
  pistonExtend: number;
  spillLight: number;
}

export const Gate: React.FC = () => {
  // Group and mesh refs
  const leftLeafRef = useRef<THREE.Group>(null);
  const rightLeafRef = useRef<THREE.Group>(null);
  const lockBarsRef = useRef<THREE.Group>(null);
  const leftPistonsRef = useRef<THREE.Group>(null);
  const rightPistonsRef = useRef<THREE.Group>(null);
  const statusLampMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const accessPanelMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const spillLightRef = useRef<THREE.SpotLight>(null);
  const dustGroupRef = useRef<THREE.Points>(null);

  // GSAP animation state proxy
  const animState = useRef<GateAnimationState>({
    panelGlow: 0.2,
    lampColorR: 0.84, // #d63031 red
    lampColorG: 0.19,
    lampColorB: 0.19,
    lampIntensity: 1.2,
    lockBarRetract: 0,
    leafSlide: 0,
    pistonExtend: 0,
    spillLight: 0,
  });

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const prevGatePRef = useRef<number>(0);

  // Build the GSAP timeline according to Phase 3 specification
  useEffect(() => {
    const s = animState.current;
    const tl = gsap.timeline({ paused: true });

    // 0.00–0.15: Access panel illuminates, status lamp transitions from red to amber
    tl.to(
      s,
      {
        panelGlow: 1.0,
        lampColorR: 0.91, // #e8a23a amber
        lampColorG: 0.64,
        lampColorB: 0.23,
        lampIntensity: 1.8,
        duration: 0.15,
        ease: 'power1.out',
      },
      0
    );

    // 0.15–0.40: Heavy steel locking bars retract along their axes into the door casing
    tl.to(
      s,
      {
        lockBarRetract: 1.0,
        duration: 0.25,
        ease: 'power2.inOut',
      },
      0.15
    );

    // 0.40–0.50: Lamp turns vibrant green, interior spill light begins
    tl.to(
      s,
      {
        lampColorR: 0.18, // #2ecc71 emerald green
        lampColorG: 0.8,
        lampColorB: 0.44,
        lampIntensity: 2.8,
        duration: 0.1,
        ease: 'linear',
      },
      0.4
    );

    // 0.40–1.00: Interior spill light ramps up to full illumination
    tl.to(
      s,
      {
        spillLight: 1.0,
        duration: 0.6,
        ease: 'power1.in',
      },
      0.4
    );

    // 0.50–0.95: Door leaves slide ±4.5 m X with power2.inOut; hydraulic pistons extend
    tl.to(
      s,
      {
        leafSlide: GATE.slideDeltaX,
        pistonExtend: 1.0,
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0.5
    );

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  // Floating dust particles outside the gate (150 motes)
  const dustParticles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14; // x: -7..7
      positions[i * 3 + 1] = Math.random() * 6 + 0.5; // y: 0.5..6.5
      positions[i * 3 + 2] = Math.random() * 14 + 2; // z: 2..16
    }
    return positions;
  }, []);

  // Frame update: sync scroll progress to timeline, sound triggers, and mesh positions
  useFrame((state) => {
    const scrollProgress = useStore.getState().progress;

    // Remap scroll range [0.12, 0.30] -> [0.0, 1.0]
    let gateP = 0;
    if (scrollProgress >= 0.3) {
      gateP = 1;
    } else if (scrollProgress > 0.12) {
      gateP = (scrollProgress - 0.12) / (0.3 - 0.12);
    }

    // Scrub GSAP timeline
    if (timelineRef.current) {
      timelineRef.current.progress(gateP);
    }

    // Audio triggers on forward threshold crossings
    const prevP = prevGatePRef.current;
    const audioOn = useStore.getState().audioEnabled;
    if (audioOn) {
      if (prevP < 0.05 && gateP >= 0.05) {
        sound.playAccessBeep();
      }
      if (prevP < 0.15 && gateP >= 0.15) {
        sound.playMechanicalClunk();
      }
      if (prevP < 0.5 && gateP >= 0.5) {
        sound.playPneumaticHiss();
      }
    }
    prevGatePRef.current = gateP;

    // Gate collider state: removed when gateP > 0.9
    const isGateOpen = gateP > 0.9;
    if (useStore.getState().gateOpen !== isGateOpen) {
      useStore.getState().setGateOpen(isGateOpen);
    }

    // Apply animation state to 3D meshes
    const s = animState.current;

    // 1. Sliding Door Leaves
    if (leftLeafRef.current) {
      leftLeafRef.current.position.x = -GATE.opening.width / 4 - s.leafSlide;
    }
    if (rightLeafRef.current) {
      rightLeafRef.current.position.x = GATE.opening.width / 4 + s.leafSlide;
    }

    // 2. Retracting Locking Bars (attached to left leaf, slide inward along X)
    if (lockBarsRef.current) {
      // Extended = x: 0 (protruding into right leaf seam); Retracted = x: -0.6
      lockBarsRef.current.position.x = -s.lockBarRetract * 0.6;
    }

    // 3. Hydraulic Piston Extension
    if (leftPistonsRef.current) {
      // Scale rod along X as door slides
      leftPistonsRef.current.scale.x = 1 + s.pistonExtend * 1.8;
    }
    if (rightPistonsRef.current) {
      rightPistonsRef.current.scale.x = 1 + s.pistonExtend * 1.8;
    }

    // 4. Status Lamp Strip Material
    if (statusLampMatRef.current) {
      statusLampMatRef.current.emissive.setRGB(s.lampColorR, s.lampColorG, s.lampColorB);
      statusLampMatRef.current.emissiveIntensity = s.lampIntensity;
    }

    // 5. Access Panel Glow
    if (accessPanelMatRef.current) {
      accessPanelMatRef.current.emissiveIntensity = 0.5 + s.panelGlow * 1.5;
    }

    // 6. Interior Spill Light
    if (spillLightRef.current) {
      spillLightRef.current.intensity = s.spillLight * 6.0;
    }

    // 7. Ambient dust mote gentle drift
    if (dustGroupRef.current) {
      dustGroupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      dustGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Spotlight target placed outside the entrance
  const spillTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 1.8, 6.0);
    return obj;
  }, []);

  return (
    <group name="gate-bunker-portal" position={[0, 0, 0]}>
      <primitive object={spillTarget} />

      {/* Concrete Portal Outer Frame (12 w x 10 h x 3 d) */}
      {/* Left Heavy Column */}
      <mesh position={[-5, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[2, 10, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#202328" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Right Heavy Column */}
      <mesh position={[5, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[2, 10, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#202328" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Lintel Beam Overhead */}
      <mesh position={[0, 8.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 3, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Threshold Floor Beam */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[12, 0.4, BUNKER_PORTAL.frame.depth]} />
        <meshStandardMaterial color="#15171a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Reinforced Structural Gusset Brackets */}
      <mesh position={[-3.8, 7.2, 0.8]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.3, 1.4, 0.8]} />
        <meshStandardMaterial color="#121417" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[3.8, 7.2, 0.8]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 1.4, 0.8]} />
        <meshStandardMaterial color="#121417" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Left Wall Access Control Terminal / Scanner */}
      <group position={[-3.8, 1.8, 1.55]} rotation={[0, 0.25, 0]}>
        {/* Terminal Housing */}
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.95, 0.25]} />
          <meshStandardMaterial color="#1b1e23" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Glowing Screen */}
        <mesh position={[0, 0.15, 0.13]}>
          <planeGeometry args={[0.48, 0.4]} />
          <meshStandardMaterial
            ref={accessPanelMatRef}
            color="#e8a23a"
            emissive="#e8a23a"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Biometric Scanner Plate */}
        <mesh position={[0, -0.22, 0.13]}>
          <boxGeometry args={[0.24, 0.24, 0.02]} />
          <meshStandardMaterial
            color="#7fb38a"
            emissive="#7fb38a"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Status Lamp Strip on the Lintel */}
      <group position={[0, 7.25, 1.55]}>
        {/* Lamp Metal Enclosure */}
        <mesh>
          <boxGeometry args={[2.8, 0.28, 0.14]} />
          <meshStandardMaterial color="#121417" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Emissive Lamp Glass */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.6, 0.16, 0.04]} />
          <meshStandardMaterial
            ref={statusLampMatRef}
            color="#d63031"
            emissive="#d63031"
            emissiveIntensity={1.2}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Left Sliding Blast Door Leaf */}
      <group ref={leftLeafRef} position={[-GATE.opening.width / 4, GATE.centre.y - 0.5, 0]}>
        {/* Beveled Heavy Door Plate (RoundedBox) */}
        <RoundedBox
          args={[GATE.opening.width / 2, GATE.opening.height, 0.45]}
          radius={0.06}
          smoothness={4}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="#272b32" metalness={0.75} roughness={0.32} />
        </RoundedBox>

        {/* Structural Horizontal Rib Reinforcements */}
        {[-2.2, 0, 2.2].map((yOffset, idx) => (
          <mesh key={`l-rib-${idx}`} position={[0, yOffset, 0.25]} castShadow>
            <boxGeometry args={[GATE.opening.width / 2 - 0.2, 0.25, 0.12]} />
            <meshStandardMaterial color="#1b1e23" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* Instanced Perimeter Bolts */}
        {[-1.6, -0.8, 0, 0.8, 1.6].map((xOffset, idx) => (
          <React.Fragment key={`l-bolts-${idx}`}>
            <mesh position={[xOffset, 3.2, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
              <meshStandardMaterial color="#0f1114" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[xOffset, -3.2, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
              <meshStandardMaterial color="#0f1114" metalness={0.9} roughness={0.2} />
            </mesh>
          </React.Fragment>
        ))}

        {/* 3 Heavy Retractable Locking Bars */}
        <group ref={lockBarsRef}>
          {[-1.8, 0, 1.8].map((yOffset, idx) => (
            <group key={`lock-bar-${idx}`} position={[2.0, yOffset, 0]}>
              {/* Outer Guide Sleeve */}
              <mesh position={[-0.25, 0, 0]}>
                <boxGeometry args={[0.5, 0.26, 0.26]} />
                <meshStandardMaterial color="#191c20" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Retracting Steel Deadbolt */}
              <mesh position={[0.2, 0, 0]} castShadow>
                <boxGeometry args={[0.65, 0.16, 0.16]} />
                <meshStandardMaterial color="#505763" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Right Sliding Blast Door Leaf */}
      <group ref={rightLeafRef} position={[GATE.opening.width / 4, GATE.centre.y - 0.5, 0]}>
        {/* Beveled Heavy Door Plate (RoundedBox) */}
        <RoundedBox
          args={[GATE.opening.width / 2, GATE.opening.height, 0.45]}
          radius={0.06}
          smoothness={4}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="#272b32" metalness={0.75} roughness={0.32} />
        </RoundedBox>

        {/* Structural Horizontal Rib Reinforcements */}
        {[-2.2, 0, 2.2].map((yOffset, idx) => (
          <mesh key={`r-rib-${idx}`} position={[0, yOffset, 0.25]} castShadow>
            <boxGeometry args={[GATE.opening.width / 2 - 0.2, 0.25, 0.12]} />
            <meshStandardMaterial color="#1b1e23" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* Instanced Perimeter Bolts */}
        {[-1.6, -0.8, 0, 0.8, 1.6].map((xOffset, idx) => (
          <React.Fragment key={`r-bolts-${idx}`}>
            <mesh position={[xOffset, 3.2, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
              <meshStandardMaterial color="#0f1114" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[xOffset, -3.2, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
              <meshStandardMaterial color="#0f1114" metalness={0.9} roughness={0.2} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Locking Bar Female Receiver Housings */}
        {[-1.8, 0, 1.8].map((yOffset, idx) => (
          <mesh key={`lock-recv-${idx}`} position={[-1.85, yOffset, 0]}>
            <boxGeometry args={[0.4, 0.24, 0.24]} />
            <meshStandardMaterial color="#191c20" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* 4 Hydraulic Pistons (2 Left, 2 Right) */}
      {/* Left Hydraulic Cylinder Housings (Fixed to frame) */}
      <group position={[-5.0, 0, 0.4]}>
        {[1.2, 6.2].map((yPos, idx) => (
          <group key={`l-cyl-${idx}`} position={[0, yPos, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 2.0, 16]} />
              <meshStandardMaterial color="#17191d" metalness={0.8} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Left Extending Chrome Piston Rods */}
      <group ref={leftPistonsRef} position={[-4.0, 0, 0.4]}>
        {[1.2, 6.2].map((yPos, idx) => (
          <group key={`l-rod-${idx}`} position={[0, yPos, 0]}>
            <mesh position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 2.0, 16]} />
              <meshStandardMaterial color="#9aa0a6" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Hydraulic Cylinder Housings (Fixed to frame) */}
      <group position={[5.0, 0, 0.4]}>
        {[1.2, 6.2].map((yPos, idx) => (
          <group key={`r-cyl-${idx}`} position={[0, yPos, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 2.0, 16]} />
              <meshStandardMaterial color="#17191d" metalness={0.8} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Extending Chrome Piston Rods */}
      <group ref={rightPistonsRef} position={[4.0, 0, 0.4]}>
        {[1.2, 6.2].map((yPos, idx) => (
          <group key={`r-rod-${idx}`} position={[0, yPos, 0]}>
            <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 2.0, 16]} />
              <meshStandardMaterial color="#9aa0a6" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Interior Spill Light (Positioned inside tunnel, pointing out into exterior) */}
      <spotLight
        ref={spillLightRef}
        position={[0, 4.0, -2.0]}
        target={spillTarget}
        angle={0.75}
        penumbra={0.65}
        intensity={0}
        color="#ffc575"
        distance={28}
        castShadow
      />

      {/* Atmospheric Dust Particles Outside Gate */}
      <points ref={dustGroupRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustParticles.length / 3}
            array={dustParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#c8d6e5"
          transparent
          opacity={0.45}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

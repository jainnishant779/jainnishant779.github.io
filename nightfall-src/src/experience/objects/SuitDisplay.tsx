import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SUIT_PLATFORM, SUIT_CASE } from '../../world/layout';
import { useStore } from '../../state/store';

export const SuitDisplay: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const setPreviousMode = useStore((state) => state.setPreviousMode);

  // Subtle pulsing glow for chest arc reactor core
  useFrame(({ clock }) => {
    if (coreRef.current && (coreRef.current.material as THREE.MeshStandardMaterial)) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      const pulse = 1.6 + Math.sin(clock.getElapsedTime() * 3.5) * 0.6;
      mat.emissiveIntensity = pulse;
    }
  });

  const handleInspectClick = () => {
    if (mode !== 'suit-inspect') {
      setPreviousMode(mode);
      setMode('suit-inspect');
    }
  };

  return (
    <group
      name="suit-display-pod"
      position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y, SUIT_PLATFORM.centre.z]}
    >
      {/* ============================================================
       * 1. Heavy Industrial Plinth & Uplight Ring
       * ============================================================ */}

      {/* Main Steel Plinth Base (0.4m high, 1.9m wide) */}
      <mesh position={[0, SUIT_CASE.plinthHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry
          args={[
            SUIT_CASE.dimensions.width + 0.35,
            SUIT_CASE.plinthHeight,
            SUIT_CASE.dimensions.depth + 0.35,
          ]}
        />
        <meshStandardMaterial color="#14181c" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Plinth Beveled Rim */}
      <mesh position={[0, SUIT_CASE.plinthHeight + 0.015, 0]}>
        <boxGeometry
          args={[
            SUIT_CASE.dimensions.width + 0.38,
            0.03,
            SUIT_CASE.dimensions.depth + 0.38,
          ]}
        />
        <meshStandardMaterial color="#222830" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Illuminated Base Uplight Ring */}
      <mesh position={[0, SUIT_CASE.plinthHeight + 0.035, 0]}>
        <cylinderGeometry
          args={[
            SUIT_CASE.dimensions.width * 0.44,
            SUIT_CASE.dimensions.width * 0.44,
            0.015,
            32,
          ]}
        />
        <meshStandardMaterial
          color="#48cae4"
          emissive="#48cae4"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>

      {/* ============================================================
       * 2. Four Vertical Corner Framing Posts & Top Cap
       * ============================================================ */}

      {[-1, 1].map((xDir) =>
        [-1, 1].map((zDir) => {
          const px = (xDir * (SUIT_CASE.dimensions.width + 0.04)) / 2;
          const pz = (zDir * (SUIT_CASE.dimensions.depth + 0.04)) / 2;
          const cy = SUIT_CASE.plinthHeight + SUIT_CASE.dimensions.height / 2;
          return (
            <mesh
              key={`suit-post-${xDir}-${zDir}`}
              position={[px, cy, pz]}
              castShadow
            >
              <boxGeometry args={[0.07, SUIT_CASE.dimensions.height, 0.07]} />
              <meshStandardMaterial color="#1a2028" metalness={0.88} roughness={0.25} />
            </mesh>
          );
        })
      )}

      {/* Top Cap Housing with Overhead Spot Fixture */}
      <mesh
        position={[
          0,
          SUIT_CASE.plinthHeight + SUIT_CASE.dimensions.height + 0.08,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            SUIT_CASE.dimensions.width + 0.2,
            0.16,
            SUIT_CASE.dimensions.depth + 0.2,
          ]}
        />
        <meshStandardMaterial color="#121519" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Recessed Ceiling Downlight Emitter in Cap */}
      <mesh
        position={[
          0,
          SUIT_CASE.plinthHeight + SUIT_CASE.dimensions.height - 0.01,
          0,
        ]}
      >
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshBasicMaterial color="#e0f7fa" />
      </mesh>

      {/* ============================================================
       * 3. Warden Exoskeleton Suit Mesh (Facing +X toward main walkway)
       * ============================================================ */}

      <group
        position={[0, SUIT_CASE.plinthHeight + 0.95, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={handleInspectClick}
      >
        {/* Torso Ballistic Breastplate */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.48, 0.62, 0.3]} />
          <meshStandardMaterial color="#13161a" metalness={0.82} roughness={0.28} />
        </mesh>

        {/* Layered Pectoral Armor Plates */}
        <mesh position={[-0.12, 0.44, 0.16]} rotation={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.2, 0.22, 0.04]} />
          <meshStandardMaterial color="#1a1e23" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.12, 0.44, 0.16]} rotation={[0, -0.08, 0]} castShadow>
          <boxGeometry args={[0.2, 0.22, 0.04]} />
          <meshStandardMaterial color="#1a1e23" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Abdominal Articulated Plating */}
        {[-0.15, -0.08, -0.01].map((yOff, i) => (
          <mesh key={`ab-plate-${i}`} position={[0, 0.28 + yOff, 0.14]} castShadow>
            <boxGeometry args={[0.34 - i * 0.03, 0.05, 0.04]} />
            <meshStandardMaterial color="#16191e" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Glowing Arc Reactor Chest Core */}
        <mesh ref={coreRef} position={[0, 0.46, 0.165]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          <meshStandardMaterial
            color="#48cae4"
            emissive="#48cae4"
            emissiveIntensity={2.0}
            roughness={0.1}
          />
        </mesh>

        {/* Spinal Exoskeleton Vertebrae running down the back */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((y, idx) => (
          <mesh key={`spine-${idx}`} position={[0, y, -0.16]}>
            <boxGeometry args={[0.08, 0.06, 0.05]} />
            <meshStandardMaterial color="#252c35" metalness={0.92} roughness={0.2} />
          </mesh>
        ))}

        {/* Tactical Helmet */}
        <mesh position={[0, 0.86, 0.01]} castShadow>
          <sphereGeometry args={[0.17, 18, 18]} />
          <meshStandardMaterial color="#121519" metalness={0.9} roughness={0.22} />
        </mesh>
        {/* Angular Helmet Cheek Guards */}
        <mesh position={[-0.12, 0.82, 0.08]} rotation={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.08, 0.14, 0.12]} />
          <meshStandardMaterial color="#1c2026" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.12, 0.82, 0.08]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.08, 0.14, 0.12]} />
          <meshStandardMaterial color="#1c2026" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Glowing Visor Slit */}
        <mesh position={[0, 0.87, 0.155]}>
          <boxGeometry args={[0.19, 0.035, 0.03]} />
          <meshStandardMaterial
            color="#48cae4"
            emissive="#48cae4"
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>

        {/* Rebreather Filters on chin */}
        <mesh position={[0, 0.76, 0.14]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
          <meshStandardMaterial color="#242a32" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Overlapping Shoulder Pauldrons */}
        <group position={[-0.34, 0.58, 0]}>
          <mesh rotation={[0, 0, 0.25]} castShadow>
            <boxGeometry args={[0.22, 0.14, 0.26]} />
            <meshStandardMaterial color="#1a1e24" metalness={0.88} roughness={0.24} />
          </mesh>
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[0.19, 0.1, 0.23]} />
            <meshStandardMaterial color="#14171c" metalness={0.85} roughness={0.28} />
          </mesh>
        </group>
        <group position={[0.34, 0.58, 0]}>
          <mesh rotation={[0, 0, -0.25]} castShadow>
            <boxGeometry args={[0.22, 0.14, 0.26]} />
            <meshStandardMaterial color="#1a1e24" metalness={0.88} roughness={0.24} />
          </mesh>
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.19, 0.1, 0.23]} />
            <meshStandardMaterial color="#14171c" metalness={0.85} roughness={0.28} />
          </mesh>
        </group>

        {/* Arms / Biceps with Exposed Hydraulic Pistons */}
        <mesh position={[-0.32, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.068, 0.35, 12]} />
          <meshStandardMaterial color="#15181d" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.32, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.068, 0.35, 12]} />
          <meshStandardMaterial color="#15181d" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Forearms & Gauntlets */}
        <mesh position={[-0.32, -0.02, 0.05]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.11, 0.34, 0.13]} />
          <meshStandardMaterial color="#191d22" metalness={0.85} roughness={0.26} />
        </mesh>
        <mesh position={[0.32, -0.02, 0.05]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.11, 0.34, 0.13]} />
          <meshStandardMaterial color="#191d22" metalness={0.85} roughness={0.26} />
        </mesh>

        {/* Left Gauntlet Wrist Terminal Display Screen */}
        <mesh position={[-0.32, 0.02, 0.12]} rotation={[0.25, 0, 0]}>
          <planeGeometry args={[0.07, 0.09]} />
          <meshBasicMaterial color="#48cae4" />
        </mesh>

        {/* Clenched Armored Fists */}
        <mesh position={[-0.32, -0.22, 0.08]} castShadow>
          <boxGeometry args={[0.09, 0.11, 0.1]} />
          <meshStandardMaterial color="#111317" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.32, -0.22, 0.08]} castShadow>
          <boxGeometry args={[0.09, 0.11, 0.1]} />
          <meshStandardMaterial color="#111317" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Armored Utility Belt with Power Canisters */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.49, 0.1, 0.31]} />
          <meshStandardMaterial color="#1d2229" metalness={0.8} roughness={0.3} />
        </mesh>
        {[-0.18, -0.1, 0.1, 0.18].map((bx, bi) => (
          <mesh key={`pouch-${bi}`} position={[bx, 0.05, 0.16]}>
            <boxGeometry args={[0.06, 0.08, 0.05]} />
            <meshStandardMaterial color="#242b34" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* Thigh Cuisses Plating */}
        <mesh position={[-0.14, -0.22, 0]} castShadow>
          <boxGeometry args={[0.18, 0.38, 0.2]} />
          <meshStandardMaterial color="#14171c" metalness={0.84} roughness={0.28} />
        </mesh>
        <mesh position={[0.14, -0.22, 0]} castShadow>
          <boxGeometry args={[0.18, 0.38, 0.2]} />
          <meshStandardMaterial color="#14171c" metalness={0.84} roughness={0.28} />
        </mesh>

        {/* Articulated Knee Guards */}
        <mesh position={[-0.14, -0.44, 0.1]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.16, 0.11, 0.08]} />
          <meshStandardMaterial color="#202630" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0.14, -0.44, 0.1]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.16, 0.11, 0.08]} />
          <meshStandardMaterial color="#202630" metalness={0.9} roughness={0.22} />
        </mesh>

        {/* Shin Greaves */}
        <mesh position={[-0.14, -0.66, 0.02]} castShadow>
          <boxGeometry args={[0.16, 0.38, 0.18]} />
          <meshStandardMaterial color="#16191e" metalness={0.85} roughness={0.27} />
        </mesh>
        <mesh position={[0.14, -0.66, 0.02]} castShadow>
          <boxGeometry args={[0.16, 0.38, 0.18]} />
          <meshStandardMaterial color="#16191e" metalness={0.85} roughness={0.27} />
        </mesh>

        {/* Magnetic Combat Sabatons (Boots) locked to plinth */}
        <mesh position={[-0.14, -0.89, 0.06]} castShadow>
          <boxGeometry args={[0.17, 0.12, 0.28]} />
          <meshStandardMaterial color="#0e1114" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.14, -0.89, 0.06]} castShadow>
          <boxGeometry args={[0.17, 0.12, 0.28]} />
          <meshStandardMaterial color="#0e1114" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ============================================================
       * 4. Protective Glass Enclosure Box
       * ============================================================ */}

      <mesh
        position={[
          0,
          SUIT_CASE.plinthHeight + SUIT_CASE.dimensions.height / 2,
          0,
        ]}
        onClick={handleInspectClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
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
          roughness={0.04}
          metalness={0.2}
          transparent
          opacity={0.16}
        />
      </mesh>
    </group>
  );
};

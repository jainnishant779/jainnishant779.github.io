import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  MAIN_WALKWAY,
  COMMAND_PLATFORM,
  SUIT_PLATFORM,
} from '../../world/layout';
import { usePBR } from '../../lib/assets';

export const Walkways: React.FC = () => {
  const mainWalkwayLength = Math.abs(MAIN_WALKWAY.end.z - MAIN_WALKWAY.start.z); // 35m
  const mainWalkwayCenterZ = (MAIN_WALKWAY.start.z + MAIN_WALKWAY.end.z) / 2; // -37.5
  const gratingPBR = usePBR('grating');

  // Support I-beam positions along the main walkway
  const supportPositions = [-24, -30, -36, -42, -48, -54];

  // Instanced handrail posts along both sides of main walkway (every 2m)
  const postGeom = useMemo(() => new THREE.BoxGeometry(0.06, 1.05, 0.06), []);
  const { postMatrices } = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const mat = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);

    for (let z = MAIN_WALKWAY.start.z; z >= MAIN_WALKWAY.end.z; z -= 2.5) {
      // Left post
      pos.set(-MAIN_WALKWAY.width / 2 + 0.08, MAIN_WALKWAY.startY + 0.52, z);
      mat.compose(pos, rot, scale);
      matrices.push(mat.clone());

      // Right post (skip junction at z = -42 on the left side)
      pos.set(MAIN_WALKWAY.width / 2 - 0.08, MAIN_WALKWAY.startY + 0.52, z);
      mat.compose(pos, rot, scale);
      matrices.push(mat.clone());
    }
    return { postMatrices: matrices };
  }, []);

  return (
    <group name="steel-walkways">
      {/* Main Walkway Grating Deck (from z = -20 to -55) */}
      <mesh
        position={[0, MAIN_WALKWAY.startY - 0.05, mainWalkwayCenterZ]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[MAIN_WALKWAY.width, 0.1, mainWalkwayLength]} />
        <meshStandardMaterial
          color="#1e2228"
          metalness={0.8}
          roughness={0.35}
          alphaMap={gratingPBR.alphaMap || undefined}
          transparent={!!gratingPBR.alphaMap}
          alphaTest={0.5}
        />
      </mesh>

      {/* Main Walkway Structural Longitudinal Steel Channels */}
      <mesh position={[-MAIN_WALKWAY.width / 2, MAIN_WALKWAY.startY - 0.2, mainWalkwayCenterZ]}>
        <boxGeometry args={[0.15, 0.35, mainWalkwayLength]} />
        <meshStandardMaterial color="#14171a" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[MAIN_WALKWAY.width / 2, MAIN_WALKWAY.startY - 0.2, mainWalkwayCenterZ]}>
        <boxGeometry args={[0.15, 0.35, mainWalkwayLength]} />
        <meshStandardMaterial color="#14171a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Heavy Steel I-Beam Structural Pillars descending into darkness */}
      {supportPositions.map((zPos) => (
        <group key={`ibeam-support-${zPos}`} position={[0, -6.5, zPos]}>
          {/* Left Vertical I-Beam Column */}
          <mesh position={[-MAIN_WALKWAY.width / 2, 0, 0]} receiveShadow>
            <boxGeometry args={[0.25, 11, 0.25]} />
            <meshStandardMaterial color="#101215" metalness={0.9} roughness={0.4} />
          </mesh>
          {/* Right Vertical I-Beam Column */}
          <mesh position={[MAIN_WALKWAY.width / 2, 0, 0]} receiveShadow>
            <boxGeometry args={[0.25, 11, 0.25]} />
            <meshStandardMaterial color="#101215" metalness={0.9} roughness={0.4} />
          </mesh>
          {/* Horizontal Cross Strut */}
          <mesh position={[0, 4.8, 0]}>
            <boxGeometry args={[MAIN_WALKWAY.width + 0.3, 0.2, 0.2]} />
            <meshStandardMaterial color="#14171a" metalness={0.85} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Instanced Railing Vertical Posts */}
      <instancedMesh
        args={[postGeom, undefined, postMatrices.length]}
        castShadow
        ref={(inst) => {
          if (inst) {
            postMatrices.forEach((m, idx) => inst.setMatrixAt(idx, m));
            inst.instanceMatrix.needsUpdate = true;
          }
        }}
      >
        <meshStandardMaterial color="#2d333b" metalness={0.85} roughness={0.25} />
      </instancedMesh>

      {/* Continuous Top Handrail Pipes */}
      <mesh position={[-MAIN_WALKWAY.width / 2 + 0.08, MAIN_WALKWAY.startY + 1.05, mainWalkwayCenterZ]}>
        <cylinderGeometry args={[0.035, 0.035, mainWalkwayLength, 8]} />
        <meshStandardMaterial color="#363d47" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[MAIN_WALKWAY.width / 2 - 0.08, MAIN_WALKWAY.startY + 1.05, mainWalkwayCenterZ]}>
        <cylinderGeometry args={[0.035, 0.035, mainWalkwayLength, 8]} />
        <meshStandardMaterial color="#363d47" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Side Walkway Branch to Suit Platform (at z = -42, extends from x = 0 to x = -16) */}
      <mesh
        position={[-8, SUIT_PLATFORM.centre.y - 0.05, SUIT_PLATFORM.junctionZ]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[16, 0.1, 2.5]} />
        <meshStandardMaterial
          color="#1e2228"
          metalness={0.8}
          roughness={0.35}
          alphaMap={gratingPBR.alphaMap || undefined}
          transparent={!!gratingPBR.alphaMap}
          alphaTest={0.5}
        />
      </mesh>

      {/* Suit Platform Raised Deck (5 x 5 at (-16, -1, -42)) */}
      <mesh
        position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y - 0.1, SUIT_PLATFORM.centre.z]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[SUIT_PLATFORM.deckSize.width, 0.2, SUIT_PLATFORM.deckSize.depth]} />
        <meshStandardMaterial color="#1a1e23" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Stairs leading up to Command Platform (from y=-1 at z=-55 to y=1 at z=-58) */}
      {/* 6 Individual Stair Treads */}
      {[0, 1, 2, 3, 4, 5].map((stepIdx) => {
        const stepY = -1.0 + (stepIdx + 0.5) * (2.0 / 6);
        const stepZ = -55.0 - (stepIdx + 0.5) * (3.0 / 6);
        return (
          <mesh key={`stair-step-${stepIdx}`} position={[0, stepY, stepZ]} receiveShadow castShadow>
            <boxGeometry args={[MAIN_WALKWAY.width, 0.1, 0.55]} />
            <meshStandardMaterial color="#222830" metalness={0.85} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Command Center Raised Octagonal Platform Deck (12 x 8 at (0, 1, -62)) */}
      <mesh
        position={[COMMAND_PLATFORM.centre.x, COMMAND_PLATFORM.centre.y - 0.15, COMMAND_PLATFORM.centre.z]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[COMMAND_PLATFORM.deckSize.width, 0.3, COMMAND_PLATFORM.deckSize.depth]} />
        <meshStandardMaterial color="#181c21" metalness={0.85} roughness={0.28} />
      </mesh>

      {/* Command Platform Heavy Support Pillars going down into darkness */}
      {[-5, 5].map((x) =>
        [-59, -65].map((z) => (
          <mesh key={`col-${x}-${z}`} position={[x, -5, z]} receiveShadow>
            <cylinderGeometry args={[0.35, 0.45, 12, 12]} />
            <meshStandardMaterial color="#121518" metalness={0.9} roughness={0.35} />
          </mesh>
        ))
      )}
    </group>
  );
};

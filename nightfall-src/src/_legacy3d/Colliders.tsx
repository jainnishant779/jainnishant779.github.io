import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useStore } from '../state/store';
import {
  MAIN_WALKWAY,
  COMMAND_PLATFORM,
  SUIT_PLATFORM,
  SUIT_CASE,
  BATCOMPUTER,
  TUNNEL,
  GATE,
} from '../world/layout';

export const Colliders: React.FC = () => {
  const gateOpen = useStore((state) => state.gateOpen);
  const tunnelLength = Math.abs(TUNNEL.endZ - TUNNEL.startZ); // 20m
  const tunnelCenterZ = (TUNNEL.startZ + TUNNEL.endZ) / 2; // -10

  const mainWalkwayLength = Math.abs(MAIN_WALKWAY.end.z - MAIN_WALKWAY.start.z); // 35m
  const mainWalkwayCenterZ = (MAIN_WALKWAY.start.z + MAIN_WALKWAY.end.z) / 2; // -37.5

  return (
    <group name="world-colliders">
      {/* 1. Exterior Approach Ground Floor */}
      <RigidBody type="fixed" position={[0, -0.2, 10]} colliders={false}>
        <CuboidCollider args={[15, 0.2, 10]} />
      </RigidBody>

      {/* 2. Blast Gate Collider (Active when gate is locked/closed, removed when gateOpen > 0.9) */}
      {!gateOpen && (
        <RigidBody type="fixed" position={[0, GATE.centre.y - 0.5, 0]} colliders={false}>
          <CuboidCollider args={[GATE.opening.width / 2, GATE.opening.height / 2, 0.4]} />
        </RigidBody>
      )}

      {/* 3. Access Tunnel Walkable Floor and Walls */}
      <RigidBody type="fixed" position={[0, -0.6, tunnelCenterZ]} colliders={false}>
        <CuboidCollider args={[TUNNEL.width / 2, 0.2, tunnelLength / 2]} />
      </RigidBody>
      {/* Tunnel Left Wall */}
      <RigidBody type="fixed" position={[-TUNNEL.width / 2 - 0.2, 2.5, tunnelCenterZ]} colliders={false}>
        <CuboidCollider args={[0.3, TUNNEL.height / 2, tunnelLength / 2]} />
      </RigidBody>
      {/* Tunnel Right Wall */}
      <RigidBody type="fixed" position={[TUNNEL.width / 2 + 0.2, 2.5, tunnelCenterZ]} colliders={false}>
        <CuboidCollider args={[0.3, TUNNEL.height / 2, tunnelLength / 2]} />
      </RigidBody>

      {/* 4. Main Steel Walkway Deck Floor (z = -20 to -55) */}
      <RigidBody type="fixed" position={[0, MAIN_WALKWAY.startY - 0.1, mainWalkwayCenterZ]} colliders={false}>
        <CuboidCollider args={[MAIN_WALKWAY.width / 2, 0.15, mainWalkwayLength / 2]} />
      </RigidBody>

      {/* Main Walkway Left Handrail Collider (with opening at z = -42 for side bridge) */}
      <RigidBody type="fixed" position={[-MAIN_WALKWAY.width / 2, MAIN_WALKWAY.startY + 0.6, -30.5]} colliders={false}>
        <CuboidCollider args={[0.1, 0.6, 10.5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-MAIN_WALKWAY.width / 2, MAIN_WALKWAY.startY + 0.6, -48.5]} colliders={false}>
        <CuboidCollider args={[0.1, 0.6, 6.5]} />
      </RigidBody>

      {/* Main Walkway Right Handrail Collider */}
      <RigidBody type="fixed" position={[MAIN_WALKWAY.width / 2, MAIN_WALKWAY.startY + 0.6, mainWalkwayCenterZ]} colliders={false}>
        <CuboidCollider args={[0.1, 0.6, mainWalkwayLength / 2]} />
      </RigidBody>

      {/* 5. Side Walkway Bridge to Suit Platform (at z = -42, x from 0 to -16) */}
      <RigidBody type="fixed" position={[-8, SUIT_PLATFORM.centre.y - 0.1, SUIT_PLATFORM.junctionZ]} colliders={false}>
        <CuboidCollider args={[8, 0.15, 1.25]} />
      </RigidBody>
      {/* Bridge North and South Handrails */}
      <RigidBody type="fixed" position={[-8, SUIT_PLATFORM.centre.y + 0.6, SUIT_PLATFORM.junctionZ + 1.25]} colliders={false}>
        <CuboidCollider args={[8, 0.6, 0.08]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-8, SUIT_PLATFORM.centre.y + 0.6, SUIT_PLATFORM.junctionZ - 1.25]} colliders={false}>
        <CuboidCollider args={[8, 0.6, 0.08]} />
      </RigidBody>

      {/* 6. Suit Platform Raised Deck Floor and Handrails */}
      <RigidBody
        type="fixed"
        position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y - 0.1, SUIT_PLATFORM.centre.z]}
        colliders={false}
      >
        <CuboidCollider args={[SUIT_PLATFORM.deckSize.width / 2, 0.15, SUIT_PLATFORM.deckSize.depth / 2]} />
      </RigidBody>
      {/* West edge railing */}
      <RigidBody type="fixed" position={[SUIT_PLATFORM.centre.x - 2.5, SUIT_PLATFORM.centre.y + 0.6, SUIT_PLATFORM.centre.z]} colliders={false}>
        <CuboidCollider args={[0.1, 0.6, 2.5]} />
      </RigidBody>
      {/* North edge railing */}
      <RigidBody type="fixed" position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y + 0.6, SUIT_PLATFORM.centre.z + 2.5]} colliders={false}>
        <CuboidCollider args={[2.5, 0.6, 0.1]} />
      </RigidBody>
      {/* South edge railing */}
      <RigidBody type="fixed" position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y + 0.6, SUIT_PLATFORM.centre.z - 2.5]} colliders={false}>
        <CuboidCollider args={[2.5, 0.6, 0.1]} />
      </RigidBody>
      {/* Suit Glass Display Case Collider */}
      <RigidBody
        type="fixed"
        position={[SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y + SUIT_CASE.plinthHeight + SUIT_CASE.dimensions.height / 2, SUIT_PLATFORM.centre.z]}
        colliders={false}
      >
        <CuboidCollider
          args={[
            SUIT_CASE.dimensions.width / 2,
            SUIT_CASE.dimensions.height / 2,
            SUIT_CASE.dimensions.depth / 2,
          ]}
        />
      </RigidBody>

      {/* 7. Stepped Ramp / Stairs (from y = -1 at z = -55 to y = 1 at z = -58) */}
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const stepY = -1.0 + (idx + 0.5) * (2.0 / 6);
        const stepZ = -55.0 - (idx + 0.5) * (3.0 / 6);
        return (
          <RigidBody key={`stair-col-${idx}`} type="fixed" position={[0, stepY - 0.1, stepZ]} colliders={false}>
            <CuboidCollider args={[MAIN_WALKWAY.width / 2, 0.18, 0.3]} />
          </RigidBody>
        );
      })}

      {/* 8. Command Platform Raised Deck Floor (12w x 8d at (0, 1, -62)) */}
      <RigidBody
        type="fixed"
        position={[COMMAND_PLATFORM.centre.x, COMMAND_PLATFORM.centre.y - 0.1, COMMAND_PLATFORM.centre.z]}
        colliders={false}
      >
        <CuboidCollider args={[COMMAND_PLATFORM.deckSize.width / 2, 0.2, COMMAND_PLATFORM.deckSize.depth / 2]} />
      </RigidBody>

      {/* Command Platform Railings and Desk Blocker */}
      <RigidBody type="fixed" position={[-6.0, COMMAND_PLATFORM.centre.y + 0.6, COMMAND_PLATFORM.centre.z]} colliders={false}>
        <CuboidCollider args={[0.1, 0.6, 4.0]} />
      </RigidBody>
      <RigidBody type="fixed" position={[6.0, COMMAND_PLATFORM.centre.y + 0.6, COMMAND_PLATFORM.centre.z]} colliders={false}>
        <CuboidCollider args={[0.1, 0.6, 4.0]} />
      </RigidBody>
      {/* Back Boundary behind console */}
      <RigidBody type="fixed" position={[0, COMMAND_PLATFORM.centre.y + 0.8, -66.1]} colliders={false}>
        <CuboidCollider args={[6.0, 0.8, 0.2]} />
      </RigidBody>
      {/* Batcomputer Desk Blocker Collider */}
      <RigidBody
        type="fixed"
        position={[BATCOMPUTER.deskCentre.x, BATCOMPUTER.deskCentre.y + 0.5, BATCOMPUTER.deskCentre.z]}
        colliders={false}
      >
        <CuboidCollider args={[2.5, 0.5, 1.2]} />
      </RigidBody>

      {/* 9. Abyss Safety Catch Plane (Prevents player from falling below y = -2) */}
      <RigidBody type="fixed" position={[0, -2.5, -45]} colliders={false}>
        <CuboidCollider args={[40, 0.2, 40]} />
      </RigidBody>
    </group>
  );
};

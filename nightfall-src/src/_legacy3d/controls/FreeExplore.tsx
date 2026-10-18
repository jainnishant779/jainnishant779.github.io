import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import {
  useRapier,
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
  RapierCollider,
} from '@react-three/rapier';
import { SCREEN_CAMERA_POSE } from '../../world/layout';
import { useStore } from '../../state/store';
import { sound } from '../../lib/sound';

export const FreeExplore: React.FC = () => {
  const { camera } = useThree();
  const { world } = useRapier();

  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);

  // Keyboard input state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  // Track keydown and keyup events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Rapier Kinematic Character Controller per Phase 5 spec
  const ctrl = useMemo(() => {
    const c = world.createCharacterController(0.05);
    c.enableAutostep(0.4, 0.2, true); // Automatically step up stairs
    c.enableSnapToGround(0.5); // Snap to walkways
    c.setSlideEnabled(true); // Smoothly slide along walls and railings
    return c;
  }, [world]);

  useEffect(() => {
    return () => {
      world.removeCharacterController(ctrl);
    };
  }, [world, ctrl]);

  // Initial camera orientation looking forward into cavern (-Z)
  useEffect(() => {
    camera.position.set(0, 0.6, -22);
    camera.lookAt(0, 0.6, -45);
  }, [camera]);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const moveVec = useMemo(() => new THREE.Vector3(), []);

  // Expose debug interface for Playwright tests
  useEffect(() => {
    (window as any).__NIGHTFALL_EXPLORE__ = {
      getCameraPosition: () => ({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      }),
      getPlayerPosition: () => {
        const p = bodyRef.current?.translation();
        return p ? { x: p.x, y: p.y, z: p.z } : null;
      },
      teleport: (x: number, y: number, z: number) => {
        if (bodyRef.current) {
          bodyRef.current.setTranslation({ x, y, z }, true);
          bodyRef.current.setNextKinematicTranslation({ x, y, z });
          camera.position.set(x, y + 0.75, z);
        }
      },
    };
    return () => {
      delete (window as any).__NIGHTFALL_EXPLORE__;
    };
  }, [camera]);

  // Frame update: compute movement, query collisions, update translation and camera pose
  useFrame((_, dt) => {
    if (!bodyRef.current || !colliderRef.current) return;

    // Cap delta at 50ms to prevent physics tunneling
    const delta = Math.min(dt, 0.05);

    // If OS is open, lock locomotion and smoothly focus camera on main screen
    if (useStore.getState().osOpen) {
      camera.position.lerp(
        new THREE.Vector3(SCREEN_CAMERA_POSE.position.x, SCREEN_CAMERA_POSE.position.y, SCREEN_CAMERA_POSE.position.z),
        Math.min(1, delta * 5)
      );
      camera.lookAt(SCREEN_CAMERA_POSE.lookAt.x, SCREEN_CAMERA_POSE.lookAt.y, SCREEN_CAMERA_POSE.lookAt.z);
      return;
    }

    // Camera horizontal forward direction (flattened to XZ plane)
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Horizontal right direction
    right.crossVectors(forward, camera.up).normalize();

    // Desired horizontal movement
    moveVec.set(0, 0, 0);
    if (keys.current.forward) moveVec.add(forward);
    if (keys.current.backward) moveVec.sub(forward);
    if (keys.current.right) moveVec.add(right);
    if (keys.current.left) moveVec.sub(right);

    const speed = keys.current.sprint ? 6.0 : 3.5;
    if (moveVec.lengthSq() > 0) {
      moveVec.normalize().multiplyScalar(speed * delta);
      if (useStore.getState().audioEnabled) {
        sound.playFootstep();
      }
    }

    // Apply gravity (-9.8 m/s²)
    const desiredMovement = {
      x: moveVec.x,
      y: -9.8 * delta,
      z: moveVec.z,
    };

    // Let Rapier compute movement with collision constraints
    ctrl.computeColliderMovement(colliderRef.current, desiredMovement);
    const m = ctrl.computedMovement();
    const p = bodyRef.current.translation();

    // Fall safety respawn if somehow below walkways
    if (p.y < -2.2) {
      bodyRef.current.setTranslation({ x: 0, y: -0.15, z: -22 }, true);
      bodyRef.current.setNextKinematicTranslation({ x: 0, y: -0.15, z: -22 });
      camera.position.set(0, 0.6, -22);
      return;
    }

    const nextX = p.x + m.x;
    const nextY = p.y + m.y;
    const nextZ = p.z + m.z;

    bodyRef.current.setNextKinematicTranslation({
      x: nextX,
      y: nextY,
      z: nextZ,
    });

    // Eye height is +0.75 above capsule center (giving 1.55m-1.6m eye height above floor)
    camera.position.set(nextX, nextY + 0.75, nextZ);
  });

  return (
    <>
      {/* Mouse Look Controls */}
      <PointerLockControls />

      {/* Kinematic Capsule Character Body spawned at walkway start (0, -0.15, -22) */}
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        position={[0, -0.15, -22]}
        colliders={false}
      >
        <CapsuleCollider ref={colliderRef} args={[0.5, 0.3]} />
      </RigidBody>
    </>
  );
};

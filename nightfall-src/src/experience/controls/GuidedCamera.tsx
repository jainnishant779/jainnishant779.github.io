import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../../state/store';
import { sampleCameraPose } from '../../world/cameraPath';
import { SCREEN_CAMERA_POSE } from '../../world/layout';
import { prefersReducedMotion } from '../../lib/reducedMotion';
import { getRawScrollProgress, lerp } from '../../lib/scrollProgress';

interface GuidedCameraProps {
  debug?: boolean;
}

export const GuidedCamera: React.FC<GuidedCameraProps> = () => {
  const { camera } = useThree();
  const setProgress = useStore((state) => state.setProgress);
  const mode = useStore((state) => state.mode);
  const osOpen = useStore((state) => state.osOpen);
  const progressRef = useRef(0);

  // Target vectors for sampling
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());

  // Mouse parallax tracking
  const mouse = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = prefersReducedMotion();

    const handlePointerMove = (e: MouseEvent) => {
      if (reducedMotion.current) return;
      // Normalised screen coords -1..1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    // Only drive camera when in guided mode
    if (mode !== 'guided') return;

    // Damp raw window scroll progress (lerp factor 0.12)
    const rawProgress = getRawScrollProgress();
    progressRef.current = lerp(progressRef.current, rawProgress, Math.min(1, delta * 10));

    // Snap if very close
    if (Math.abs(progressRef.current - rawProgress) < 0.001) {
      progressRef.current = rawProgress;
    }

    // Synchronize to store for UI overlay when changed
    if (Math.abs(useStore.getState().progress - progressRef.current) > 0.005) {
      setProgress(progressRef.current);
    }

    // When OS is open, smoothly dolly camera directly into the main monitor
    if (osOpen) {
      targetPos.current.set(
        SCREEN_CAMERA_POSE.position.x,
        SCREEN_CAMERA_POSE.position.y,
        SCREEN_CAMERA_POSE.position.z
      );
      targetLook.current.set(
        SCREEN_CAMERA_POSE.lookAt.x,
        SCREEN_CAMERA_POSE.lookAt.y,
        SCREEN_CAMERA_POSE.lookAt.z
      );

      if (reducedMotion.current) {
        camera.position.copy(targetPos.current);
        currentLook.current.copy(targetLook.current);
        camera.lookAt(currentLook.current);
      } else {
        camera.position.lerp(targetPos.current, Math.min(1, delta * 6));
        currentLook.current.lerp(targetLook.current, Math.min(1, delta * 6));
        camera.lookAt(currentLook.current);
      }
      return;
    }

    // Sample continuous spline curves along scroll path
    sampleCameraPose(progressRef.current, targetPos.current, targetLook.current);

    // Pointer Parallax (up to ±8° yaw, ±5° pitch)
    if (!reducedMotion.current) {
      const maxYaw = THREE.MathUtils.degToRad(8);
      const maxPitch = THREE.MathUtils.degToRad(5);
      const offsetX = mouse.current.x * Math.sin(maxYaw) * 4;
      const offsetY = -mouse.current.y * Math.sin(maxPitch) * 2;
      targetLook.current.x += offsetX;
      targetLook.current.y += offsetY;
    }

    // Smooth camera motion
    if (reducedMotion.current) {
      camera.position.copy(targetPos.current);
      currentLook.current.copy(targetLook.current);
      camera.lookAt(currentLook.current);
    } else {
      camera.position.lerp(targetPos.current, Math.min(1, delta * 8));
      currentLook.current.lerp(targetLook.current, Math.min(1, delta * 8));
      camera.lookAt(currentLook.current);
    }
  });

  return null;
};

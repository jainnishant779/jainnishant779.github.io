import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SUIT_ORBIT } from '../../world/layout';
import { prefersReducedMotion } from '../../lib/reducedMotion';

export const SuitOrbitCamera: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Initial camera placement for tactical suit inspection: angled front-right view
    const target = new THREE.Vector3(
      SUIT_ORBIT.target.x,
      SUIT_ORBIT.target.y,
      SUIT_ORBIT.target.z
    );

    // Initial position ~3.8m away from target
    camera.position.set(
      SUIT_ORBIT.target.x + 3.4,
      SUIT_ORBIT.target.y + 0.8,
      SUIT_ORBIT.target.z + 1.4
    );
    camera.lookAt(target);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[SUIT_ORBIT.target.x, SUIT_ORBIT.target.y, SUIT_ORBIT.target.z]}
      minDistance={SUIT_ORBIT.minRadius}
      maxDistance={SUIT_ORBIT.maxRadius}
      minPolarAngle={SUIT_ORBIT.minPolarAngle}
      maxPolarAngle={SUIT_ORBIT.maxPolarAngle}
      enableDamping={!prefersReducedMotion()}
      dampingFactor={0.06}
      rotateSpeed={0.8}
      zoomSpeed={0.8}
      enablePan={false}
    />
  );
};

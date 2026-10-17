import React, { Suspense } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import { useStore } from '../state/store';
import { GuidedCamera } from './controls/GuidedCamera';
import { Lighting } from './Lighting';
import { Exterior } from './environment/Exterior';
import { Gate } from './environment/Gate';
import { Tunnel } from './environment/Tunnel';
import { Cavern } from './environment/Cavern';
import { Walkways } from './environment/Walkways';
import { Water } from './environment/Water';
import { Batcomputer } from './objects/Batcomputer';
import { SuitDisplay } from './objects/SuitDisplay';

export const Experience: React.FC = () => {
  const setTier = useStore((state) => state.setTier);

  return (
    <Suspense fallback={null}>
      {/* Performance monitor automatically steps down quality if framerate drops */}
      <PerformanceMonitor
        onDecline={() => {
          setTier('low');
        }}
      />

      {/* Camera Controller */}
      <GuidedCamera />

      {/* Lighting Rig & Fog */}
      <Lighting />

      {/* World Geometry */}
      <group name="world-scene-graph">
        <Exterior />
        <Gate />
        <Tunnel />
        <Cavern />
        <Walkways />
        <Water />
        <SuitDisplay />
        <Batcomputer />
      </group>
    </Suspense>
  );
};

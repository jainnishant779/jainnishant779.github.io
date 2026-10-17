import React, { Suspense } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useStore } from '../state/store';
import { GuidedCamera } from './controls/GuidedCamera';
import { FreeExplore } from './controls/FreeExplore';
import { Colliders } from './Colliders';
import { Interactions } from './Interactions';
import { Lighting } from './Lighting';
import { Exterior } from './environment/Exterior';
import { Gate } from './environment/Gate';
import { Tunnel } from './environment/Tunnel';
import { Cavern } from './environment/Cavern';
import { Walkways } from './environment/Walkways';
import { Water } from './environment/Water';
import { Atmosphere } from './environment/Atmosphere';
import { Batcomputer } from './objects/Batcomputer';
import { SuitDisplay } from './objects/SuitDisplay';
import { PostFX } from './PostFX';

export const Experience: React.FC = () => {
  const setTier = useStore((state) => state.setTier);
  const mode = useStore((state) => state.mode);

  return (
    <Suspense fallback={null}>
      {/* Performance monitor automatically steps down quality if framerate drops */}
      <PerformanceMonitor
        onDecline={() => {
          setTier('low');
        }}
      />

      {/* Physics Simulation World & Invisible Boundary Colliders */}
      <Physics gravity={[0, -9.8, 0]}>
        <Colliders />
        {mode === 'free' ? <FreeExplore /> : <GuidedCamera />}
      </Physics>

      {/* Interactive World Proximity & Hotspots */}
      <Interactions />

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
        <Atmosphere />
      </group>

      {/* Tier-Gated Post Processing */}
      <PostFX />
    </Suspense>
  );
};

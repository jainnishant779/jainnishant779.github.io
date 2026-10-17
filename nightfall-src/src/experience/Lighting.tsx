import React from 'react';
import { LIGHTS } from '../world/layout';
import { useStore } from '../state/store';
import { TIER_CONFIGS } from '../lib/quality';

export const Lighting: React.FC = () => {
  const tier = useStore((state) => state.tier);
  const tierConfig = TIER_CONFIGS[tier];

  return (
    <group name="cave-lighting-rig">
      {/* Ambient Cave Darkness Fill */}
      <ambientLight intensity={0.25} color="#0d1419" />

      {/* Atmospheric Cavern Fog */}
      <fogExp2 attach="fog" args={['#080a0c', 0.032]} />

      {/* 1 & 2: Gate Amber Spotlights */}
      <spotLight
        position={[LIGHTS.gateSpotLeft.x, LIGHTS.gateSpotLeft.y, LIGHTS.gateSpotLeft.z]}
        target-position={[0, 3.5, 0]}
        color="#e8a23a"
        intensity={80}
        angle={Math.PI / 4}
        penumbra={0.6}
        castShadow={tierConfig.shadows}
        shadow-mapSize-width={tierConfig.shadowMapSize}
        shadow-mapSize-height={tierConfig.shadowMapSize}
      />

      <spotLight
        position={[LIGHTS.gateSpotRight.x, LIGHTS.gateSpotRight.y, LIGHTS.gateSpotRight.z]}
        target-position={[0, 3.5, 0]}
        color="#e8a23a"
        intensity={80}
        angle={Math.PI / 4}
        penumbra={0.6}
        castShadow={tierConfig.shadows}
        shadow-mapSize-width={tierConfig.shadowMapSize}
        shadow-mapSize-height={tierConfig.shadowMapSize}
      />

      {/* 3: Cavern Cool Fill Light (subterranean blue-grey) */}
      <pointLight
        position={[LIGHTS.cavernCoolFill.x, LIGHTS.cavernCoolFill.y, LIGHTS.cavernCoolFill.z]}
        color="#2b4759"
        intensity={45}
        distance={60}
        decay={2}
      />

      {/* 4: Workstation Overhead Amber Point */}
      <pointLight
        position={[LIGHTS.workstationPoint.x, LIGHTS.workstationPoint.y, LIGHTS.workstationPoint.z]}
        color="#e8a23a"
        intensity={40}
        distance={18}
        decay={2}
        castShadow={tierConfig.shadows}
      />

      {/* 5: Suit Spotlight (focused down on the suit pod) */}
      <spotLight
        position={[LIGHTS.suitSpot.x, LIGHTS.suitSpot.y, LIGHTS.suitSpot.z]}
        target-position={[-16, 0.6, -42]}
        color="#7fb38a"
        intensity={60}
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow={tierConfig.shadows}
      />

      {/* 6: Monitor Screen Glow Light */}
      <pointLight
        position={[LIGHTS.monitorPoint.x, LIGHTS.monitorPoint.y, LIGHTS.monitorPoint.z]}
        color="#e8a23a"
        intensity={15}
        distance={6}
        decay={2}
      />
    </group>
  );
};

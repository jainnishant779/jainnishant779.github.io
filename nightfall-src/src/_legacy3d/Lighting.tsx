import React from 'react';
import { Environment } from '@react-three/drei';
import { LIGHTS } from '../world/layout';
import { useStore } from '../state/store';
import { TIER_CONFIGS } from '../lib/quality';
import { isAssetAvailable, getAssetUrl } from '../lib/assets';

export const Lighting: React.FC = () => {
  const tier = useStore((state) => state.tier);
  const tierConfig = TIER_CONFIGS[tier];
  const hasHdr = isAssetAvailable('assets/cave_env.hdr');

  return (
    <group name="cave-lighting-rig">
      {/* Optional HDRI reflections if asset is available */}
      {hasHdr && (
        <Environment
          files={getAssetUrl('assets/cave_env.hdr')}
          environmentIntensity={0.3}
        />
      )}

      {/* Ambient Cave Darkness Fill */}
      <ambientLight intensity={0.2} color="#0d1419" />

      {/* 1 & 2: Gate Exterior Amber Spotlights (physical units ~150 with decay 2) */}
      <spotLight
        position={[LIGHTS.gateSpotLeft.x, LIGHTS.gateSpotLeft.y, LIGHTS.gateSpotLeft.z]}
        target-position={[0, 3.5, 0]}
        color="#e8a23a"
        intensity={150}
        decay={2}
        distance={25}
        angle={Math.PI / 4}
        penumbra={0.65}
        castShadow={tierConfig.shadows}
        shadow-mapSize-width={tierConfig.shadowMapSize}
        shadow-mapSize-height={tierConfig.shadowMapSize}
      />

      <spotLight
        position={[LIGHTS.gateSpotRight.x, LIGHTS.gateSpotRight.y, LIGHTS.gateSpotRight.z]}
        target-position={[0, 3.5, 0]}
        color="#e8a23a"
        intensity={150}
        decay={2}
        distance={25}
        angle={Math.PI / 4}
        penumbra={0.65}
        castShadow={tierConfig.shadows}
        shadow-mapSize-width={tierConfig.shadowMapSize}
        shadow-mapSize-height={tierConfig.shadowMapSize}
      />

      {/* 3: Cavern Cool Fill Light (subterranean teal/blue-grey) */}
      <pointLight
        position={[LIGHTS.cavernCoolFill.x, LIGHTS.cavernCoolFill.y, LIGHTS.cavernCoolFill.z]}
        color="#2b4759"
        intensity={40}
        distance={70}
        decay={2}
      />

      {/* 4: Workstation Overhead Warm Amber Practical Point */}
      <pointLight
        position={[LIGHTS.workstationPoint.x, LIGHTS.workstationPoint.y, LIGHTS.workstationPoint.z]}
        color="#e8a23a"
        intensity={45}
        distance={20}
        decay={2}
        castShadow={tierConfig.shadows}
      />

      {/* 5: Suit Spotlight (tactical emerald spotlight focused down on armor pod) */}
      <spotLight
        position={[LIGHTS.suitSpot.x, LIGHTS.suitSpot.y, LIGHTS.suitSpot.z]}
        target-position={[-16, 0.6, -42]}
        color="#7fb38a"
        intensity={120}
        decay={2}
        distance={18}
        angle={Math.PI / 5}
        penumbra={0.55}
        castShadow={tierConfig.shadows}
      />

      {/* 6: Monitor Arc Emissive Terminal Glow */}
      <pointLight
        position={[LIGHTS.monitorPoint.x, LIGHTS.monitorPoint.y, LIGHTS.monitorPoint.z]}
        color="#e8a23a"
        intensity={20}
        distance={8}
        decay={2}
      />
    </group>
  );
};

import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useStore } from '../state/store';
import { TIER_CONFIGS } from '../lib/quality';

export const PostFX: React.FC = () => {
  const tier = useStore((state) => state.tier);
  const tierConfig = TIER_CONFIGS[tier];

  // Low tier or when PostFX is disabled: zero overhead
  if (!tierConfig.enablePostFX || tier === 'low') {
    return null;
  }

  // Medium / High tier: Fast separable Bloom + Cinematic Vignette
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        luminanceThreshold={0.88}
        intensity={0.5}
      />
      <Vignette eskil={false} offset={0.15} darkness={0.65} />
    </EffectComposer>
  );
};

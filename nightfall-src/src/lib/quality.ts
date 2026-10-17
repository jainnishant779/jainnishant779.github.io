export type QualityTier = 'low' | 'medium' | 'high';

export interface TierSettings {
  tier: QualityTier;
  dpr: number;
  shadows: boolean;
  shadowMapSize: number;
  textureSize: 1024 | 2048;
  enablePostFX: boolean;
  enableSSAO: boolean;
  enableReflector: boolean;
  rainCount: number;
  dustCount: number;
}

export const TIER_CONFIGS: Record<QualityTier, TierSettings> = {
  low: {
    tier: 'low',
    dpr: 1,
    shadows: false,
    shadowMapSize: 512,
    textureSize: 1024,
    enablePostFX: false,
    enableSSAO: false,
    enableReflector: false,
    rainCount: 400,
    dustCount: 300,
  },
  medium: {
    tier: 'medium',
    dpr: 1.25,
    shadows: true,
    shadowMapSize: 1024,
    textureSize: 1024,
    enablePostFX: true,
    enableSSAO: false,
    enableReflector: false,
    rainCount: 1200,
    dustCount: 800,
  },
  high: {
    tier: 'high',
    dpr: 1.5,
    shadows: true,
    shadowMapSize: 2048,
    textureSize: 2048,
    enablePostFX: true,
    enableSSAO: true,
    enableReflector: true,
    rainCount: 2500,
    dustCount: 1500,
  },
};

/**
 * Automatically determine the initial hardware performance tier
 */
export function getInitialTier(): QualityTier {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'medium';
  }

  // Playwright / CI automated test runner: use balanced medium tier
  if (navigator.webdriver) {
    return 'medium';
  }

  // Detect mobile user agent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = navigator.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;

  if (isMobile || cores <= 4 || memory <= 4) {
    return 'low';
  }

  if (cores >= 8 && memory >= 8) {
    return 'high';
  }

  return 'medium';
}

/**
 * Check whether the current device is a mobile or small touch screen
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
}

import { create } from 'zustand';

export type AppMode = 'guided' | 'free' | 'os-overlay' | 'suit-inspect';

export interface AppState {
  // Scene state
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Scroll progress (0..1)
  progress: number;
  setProgress: (p: number) => void;

  // OS overlay
  osOpen: boolean;
  setOsOpen: (open: boolean) => void;

  // Active interaction prompt
  activeInteraction: string | null;
  setActiveInteraction: (id: string | null) => void;

  // Quality tier
  tier: 'low' | 'medium' | 'high';
  setTier: (tier: 'low' | 'medium' | 'high') => void;

  // Audio
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;

  // Loading
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  mode: 'guided',
  setMode: (mode) => set({ mode }),

  progress: 0,
  setProgress: (progress) => set({ progress }),

  osOpen: false,
  setOsOpen: (osOpen) => set({ osOpen }),

  activeInteraction: null,
  setActiveInteraction: (activeInteraction) => set({ activeInteraction }),

  tier: 'medium',
  setTier: (tier) => set({ tier }),

  audioEnabled: false,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),

  loaded: false,
  setLoaded: (loaded) => set({ loaded }),
}));

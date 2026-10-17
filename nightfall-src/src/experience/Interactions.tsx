import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStore } from '../state/store';
import {
  BATCOMPUTER,
  SUIT_PLATFORM,
  INTERACT_RADIUS,
} from '../world/layout';

export const Interactions: React.FC = () => {
  const { camera } = useThree();
  const mode = useStore((state) => state.mode);
  const progress = useStore((state) => state.progress);
  const activeInteraction = useStore((state) => state.activeInteraction);
  const setActiveInteraction = useStore((state) => state.setActiveInteraction);
  const setOsOpen = useStore((state) => state.setOsOpen);

  const workstationPos = useMemo(
    () => new THREE.Vector3(BATCOMPUTER.deskCentre.x, BATCOMPUTER.deskCentre.y, BATCOMPUTER.deskCentre.z),
    []
  );
  const suitPos = useMemo(
    () => new THREE.Vector3(SUIT_PLATFORM.centre.x, SUIT_PLATFORM.centre.y, SUIT_PLATFORM.centre.z),
    []
  );

  // Each frame: compute proximity distance to stations
  useFrame(() => {
    let currentTarget: string | null = null;

    if (mode === 'free') {
      const distWorkstation = camera.position.distanceTo(workstationPos);
      const distSuit = camera.position.distanceTo(suitPos);

      if (distWorkstation <= INTERACT_RADIUS.workstation) {
        currentTarget = 'workstation';
      } else if (distSuit <= INTERACT_RADIUS.suit) {
        currentTarget = 'suit';
      }
    } else {
      // In Guided Mode: based on spline scroll progress
      if (progress >= 0.85) {
        currentTarget = 'workstation';
      } else if (progress >= 0.65 && progress <= 0.76) {
        currentTarget = 'suit';
      }
    }

    if (activeInteraction !== currentTarget) {
      setActiveInteraction(currentTarget);
    }
  });

  // Listen for 'E' key press to trigger active interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        const state = useStore.getState();
        if (state.activeInteraction === 'workstation' && !state.osOpen) {
          setOsOpen(true);
        } else if (state.activeInteraction === 'suit' && state.mode !== 'suit-inspect') {
          state.setPreviousMode(state.mode);
          state.setMode('suit-inspect');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOsOpen]);

  return (
    <group name="interactive-world-hotspots">
      {/* 1. Workstation Overhead Status Tag */}
      {activeInteraction === 'workstation' && (
        <Html position={[0, 3.35, -66]} center distanceFactor={14}>
          <div
            aria-label="Workstation Console Online"
            style={{
              background: 'rgba(7, 8, 10, 0.88)',
              border: '1px solid rgba(232, 162, 58, 0.6)',
              color: '#e8a23a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '3px',
              boxShadow: '0 0 16px rgba(232, 162, 58, 0.35)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.06em',
            }}
          >
            // TERMINAL 01: NJ-OS ACTIVE
          </div>
        </Html>
      )}

      {/* 2. Tactical Suit 3D Clickable Hotspot */}
      {activeInteraction === 'suit' && (
        <Html position={[-16, 2.2, -42]} center distanceFactor={14}>
          <button
            onClick={() => {
              const state = useStore.getState();
              state.setPreviousMode(state.mode);
              state.setMode('suit-inspect');
            }}
            aria-label="Inspect Tactical Suit Pod"
            style={{
              background: 'rgba(7, 8, 10, 0.92)',
              border: '2px solid #7fb38a',
              color: '#7fb38a',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.45rem 0.95rem',
              borderRadius: '4px',
              boxShadow: '0 0 16px rgba(127, 179, 138, 0.4)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            [E] INSPECT SUIT →
          </button>
        </Html>
      )}
    </group>
  );
};

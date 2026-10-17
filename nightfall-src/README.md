# Project Nightfall — The Engineer's Cave

> A real-time 3D cinematic interactive portfolio experience for Nishant Jain (AI/ML · Edge AI · Computer Vision · IoT), inspired by industrial subterranean command facilities. Built with React 18, React Three Fiber 8, Rapier physics, and Vite.

---

## 1. Architecture Overview

- **Engine:** Three.js 0.169 + `@react-three/fiber` 8 + `@react-three/drei` 9
- **Physics:** `@react-three/rapier` 1.4 (Kinematic capsule character controller + static boundary colliders)
- **Guided Journey:** Native window scroll (900vh track) damped with cubic lerp driving a `CatmullRomCurve3` spline camera
- **Free Explore:** WASD + PointerLock first-person locomotion with autostepping stairs and fall-safety respawn
- **Cinematics:** GSAP timelines (sliding blast doors, locking deadbolts, pneumatic pistons, screen zoom dolly)
- **NJ-OS:** Dual-mode Command Center (standalone routes or in-scene 3D screen overlay) with 8 modules
- **Sound:** 100% procedural Web Audio synthesizer (subterranean cavern drone, footsteps, pneumatic hisses, mechanical deadbolt clunks, UI clicks)
- **Deployment:** Static SPA with 13 pre-generated deep routes served at `https://jainnishant779.github.io/nightfall/`

---

## 2. Directory Structure

```text
nightfall-src/
  ├── src/
  │   ├── content/             # Single source of truth for verified CV content
  │   ├── experience/          # R3F scene graph (Cavern, Gate, Batcomputer, Suit, Atmosphere)
  │   │   ├── controls/        # GuidedCamera, FreeExplore, SuitOrbitCamera
  │   │   ├── environment/     # Cavern, Exterior, Tunnel, Walkways, Water, Atmosphere
  │   │   └── objects/         # Batcomputer, MonitorCanvases, SuitDisplay
  │   ├── lib/                 # Assets loader, sound synthesizer, quality tiers, WebGL check
  │   ├── os/                  # NJ-OS Command Center interface and modules
  │   ├── pages/               # HomePage experience & standalone route wrappers
  │   ├── state/               # Zustand application state store
  │   └── world/               # Layout coordinates and spline camera path
  ├── public/                  # Static assets and PDF CV
  ├── scripts/                 # scan-assets.mjs, make-route-pages.mjs, optimize-assets.mjs
  ├── tests/                   # Playwright end-to-end test suite (27 tests)
  ├── package.json             # Pinned dependencies
  └── vite.config.ts           # Production build configuration (base: '/nightfall/')
```

---

## 3. Development & Build Workflow

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22)
- npm 9+

### Commands
```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# TypeScript typecheck
npm run typecheck

# Production build (compiles to ../nightfall and generates static route pages)
npm run build

# Preview production build locally on port 4173
npm run preview

# Run full Playwright test suite
npm test
```

---

## 4. Swapping in Custom Blender GLB Models

By default, the cavern environment is rendered via a procedural 3-octave simplex noise displaced geometry that requires 0 downloaded files.

To swap in your own custom sculpted Blender model:
1. Export your 3D cavern from Blender as a binary GLTF (`.glb`).
2. Place the file at:
   ```text
   public/assets/models/cavern.glb
   ```
3. Run:
   ```bash
   node scripts/scan-assets.mjs
   ```
4. `src/experience/environment/Cavern.tsx` detects the model via `isAssetAvailable('assets/models/cavern.glb')` and automatically mounts `<BlenderCavern />` in place of the procedural shell.

---

## 5. Testing & Quality Assurance

The test suite in `tests/` contains 27 automated Playwright tests verifying:
- All static deep routes return 200 on initial load and hard reload
- PDF CV download trigger and file validity
- WebGL2 hardware detection and fallback notice
- Guided camera spline progress and screenshot capture
- Blast gate GSAP timeline scrubbing
- Rapier kinematic physics, WASD movement, and stair climbing
- Batcomputer 5-monitor arc telemetry and screen zoom dolly
- Warden tactical exoskeleton pod orbit inspection and HUD telemetry
- Procedural audio synthesizer and accessibility (`prefers-reduced-motion`)
- Section 6 external links verification

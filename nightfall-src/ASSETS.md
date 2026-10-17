# Project Nightfall — 3D Asset Manifest & Licensing

This document details all 3D textures, models, and audio specifications used in Project Nightfall.

---

## 1. Zero-Asset Procedural Default (Built-in)

Project Nightfall ships with a **100% procedural fallback pipeline**:
- **PBR Textures:** Procedurally generated HTML5 canvas noise textures for Rock, Concrete, Steel Grating, and Water (`src/materials/procedural.ts`).
- **3D Cavern:** Displaced inverted sphere geometry using 3-octave simplex noise (`src/experience/environment/Cavern.tsx`).
- **Armored Suit:** Procedural Warden Exoskeleton MK-IV constructed from 25+ geometric primitives (`src/experience/objects/SuitDisplay.tsx`).
- **Batcomputer Monorepo:** 5 live HTML5 CanvasTextures updated at 10 FPS (`src/experience/objects/MonitorCanvases.ts`).
- **Audio Synthesizer:** Pure Web Audio API procedural synthesis with zero audio files (`src/lib/sound.ts`).

The application never crashes when external assets are absent.

---

## 2. Recommended Free Assets (Optional Drop-in Upgrades)

When higher visual fidelity is desired, drop free CC0 / CC-BY assets into `public/assets/`:

### A. PBR Textures (ambientCG / Poly Haven — CC0 Public Domain)
Place texture maps into `public/assets/textures/<category>/`:
- `rock/` (`albedo.jpg`, `normal.jpg`, `roughness.jpg`) — ambientCG Rock028 / Rock035
- `rock_wet/` (`albedo.jpg`, `normal.jpg`, `roughness.jpg`)
- `concrete/` (`albedo.jpg`, `normal.jpg`, `roughness.jpg`) — ambientCG Concrete019
- `metal_plate/` (`albedo.jpg`, `normal.jpg`, `roughness.jpg`, `metalness.jpg`)
- `grating/` (`albedo.jpg`, `normal.jpg`, `roughness.jpg`, `alpha.jpg`)
- `water/` (`water_normal.jpg`) — Poly Haven WaterNormal01

### B. 3D GLB Models (CC0 / CC-BY with Attribution)
Place optimized GLB files into `public/assets/models/`:
- `cavern.glb`: Custom cavern environment sculpted in Blender. When detected by `scan-assets.mjs`, `Cavern.tsx` automatically mounts `<BlenderCavern />` in place of the procedural shell.
- `suit.glb`: Tactical armored suit model.

---

## 3. Asset Scanning & Optimization Pipeline

1. **Scan Assets:**
   ```bash
   node scripts/scan-assets.mjs
   ```
   Recursively discovers files in `public/assets/` and writes `public/assets/available.json`. This script runs automatically before `npm run dev` and `npm run build`.

2. **Optimize Textures (2K -> 1K/512px WebP):**
   ```bash
   node scripts/optimize-assets.mjs
   ```

---

## 4. Licenses
- Procedural code and shaders: MIT License.
- External PBR textures (Poly Haven, ambientCG): CC0 1.0 Universal (Public Domain).
- Audio synthesis: Mathematical waveforms via Web Audio API (Public Domain).

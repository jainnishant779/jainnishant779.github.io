# Project Nightfall — Asset Attribution & Provenance

This document tracks all external and internal assets utilized in Project Nightfall.
All assets strictly comply with CC0 or CC-BY licensing terms.

## 1. Document & Media Assets

| Asset Path | Origin / Source | License | Notes |
|---|---|---|---|
| `public/cv/Nishant_Jain_CV.pdf` | Root repository (`Nishant_Jain_CV_OnePage.pdf`) | Proprietary / Nishant Jain | Verified 1-page CV |
| `public/images/projects/edgedesk.jpg` | `assets/batcave/card-edgedesk.jpg` | Original concept artwork | Caption: "Illustrative artwork — not a product screenshot." |
| `public/images/projects/poultry-health-ai.jpg` | `assets/batcave/card-poultry.jpg` | Original concept artwork | Caption: "Illustrative artwork — not a product screenshot." |
| `public/images/projects/facial-attendance.jpg` | `assets/batcave/card-attendance.jpg` | Original concept artwork | Caption: "Illustrative artwork — not a product screenshot." |
| `public/images/projects/on-device-ai.jpg` | `assets/batcave/card-ondevice.jpg` | Original concept artwork | Caption: "Illustrative artwork — not a product screenshot." |

## 2. 3D & Environment Textures (Phase 0 / User Homework)

When downloading CC0/CC-BY textures from ambientCG.com or polyhaven.com, record their specific URLs and attribution entries below:

| Directory | Intended Source | License | Download Status |
|---|---|---|---|
| `public/assets/textures/rock` | ambientCG "Rock" or Poly Haven "rock" | CC0 | Pending download / Procedural fallback active |
| `public/assets/textures/rock_wet` | ambientCG "Rock Wet" | CC0 | Pending download / Procedural fallback active |
| `public/assets/textures/concrete` | ambientCG "Concrete" | CC0 | Pending download / Procedural fallback active |
| `public/assets/textures/metal_plate` | ambientCG "MetalPlates" | CC0 | Pending download / Procedural fallback active |
| `public/assets/textures/metal_rust` | ambientCG "MetalPainted" | CC0 | Pending download / Procedural fallback active |
| `public/assets/textures/grating` | ambientCG "MetalWalkway" (with opacity map) | CC0 | Pending download / Procedural fallback active |
| `public/assets/textures/ground_wet` | Poly Haven "mud" / "wet ground" | CC0 | Pending download / Procedural fallback active |
| `public/assets/hdri/cave_env.hdr` | Poly Haven indoor/industrial 1K HDR | CC0 | Pending download / Procedural fallback active |
| `public/assets/models/suit.glb` | Sketchfab tactical armor / armored suit | CC-BY / CC0 | Pending download / Procedural fallback active |
| `public/assets/audio/ambience.mp3` | Freesound.org cave drip ambience | CC0 | Optional / Procedural fallback active |

*Note: The asset loading architecture (`src/lib/assets.ts`) automatically falls back to procedural CanvasTexture generators if physical assets are not present in `public/assets/`.*

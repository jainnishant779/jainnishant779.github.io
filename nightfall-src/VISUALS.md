# VISUALS.md — regenerate the cave film (for Antigravity / Gemini / Veo)

Goal: replace the current film (`public/film/*`, built from an old AI video) with a sharp, consistent, photoreal one.
The site scrubs this film with the scroll wheel: **gate opens → walk in → catwalk + waterfall → stairs → workstation → push in to the main monitor**.
Live HTML (the OS) is composited onto the three monitors, so **the monitors in the last frame must be blank**.

## 1. What is wrong with the current visuals (measured on the real frames)

| Problem | Where | Fix |
|---|---|---|
| Journey is broken: after the gate the film jumps straight to a symmetric hall with a chair; there is no catwalk, waterfall or stairs | frames ~50–140 | New clips C2 + C3 (below) |
| Final frames have AI-baked UI on the monitors with garbled text ("AI/ML ENGINEER", fake face portrait) that fights the live OS | frames ~190–239 | Clean-plate keyframes K5/K6: **monitors blank** |
| Soft/blurry, 12 fps AI-video morphing | whole film | 1080p keyframes + Veo first/last-frame clips + sharper encode |
| Grade jumps warm amber → cold desaturated teal | gate → hall | One shared WORLD BIBLE for every prompt |
| Existing keyframes are too small: K1–K3 are **1024×469** (not 16:9), K4–K6 are **1376×768** | `raw/keyframes` | Regenerate at **≥1920×1080 (4K if offered), exactly 16:9** |
| K5/K6 contain invented claims ("98.4%", "Client Production Deployment", "Potent Application Filed") | `raw/keyframes` | Never put text on screens (rule below) |
| K2 shows the Batman Tumbler | `raw/keyframes/K2.png` | No branded vehicles. Leave the platform empty |

## 2. Hard rules for every image and video

1. **No text, letters, numbers, logos, signs or watermarks anywhere** (the model cannot spell; live HTML supplies all text).
2. **No people, characters, masks, capes, bat symbols, or branded vehicles** (Batman IP).
3. **All monitors in K5/K6 are ON but completely blank**: uniform very dark navy, faint even cyan glow, no UI, no map, no reflections on the glass.
4. Exactly **16:9**, **≥ 1920×1080**, PNG for stills, **MP4 1080p, 16:9, no audio** for clips.
5. One continuous camera move per clip. No cuts, no zoom pumping, no speed changes, no new objects appearing.
6. Same world in every shot: waterfall on the RIGHT, industrial pipes on the LEFT, workstation straight ahead.

## 3. WORLD BIBLE (paste at the top of EVERY prompt)

```
WORLD BIBLE (keep identical in every shot):
Photorealistic cinematic still, Unreal Engine 5 path-traced quality, full-frame cinema camera, 28mm lens,
eye height 1.6 m, level horizon, no tilt, no fisheye, 16:9.
LOCATION: a secret engineering facility built inside a natural underground cavern.
ROCK: wet near-black basalt with sharp fractured faces, glistening highlights, patches of dark moss.
METAL: dark weathered gunmetal steel, heavy rivets, bolted plates, worn yellow-black hazard stripes, brushed-steel
hydraulic pistons, thick industrial pipes along the LEFT wall with a red-brown valve wheel.
FLOORS: wet riveted steel deck plates and black open-grid steel catwalks with tubular steel railings and small amber LED strips.
LIGHTS: warm amber practical lights (vertical wall bars and caged bulkhead lamps, 2700K, soft bloom); cool blue-grey
ambient fill from the cavern; strong contrast, deep shadows, no pure-black crush.
ATMOSPHERE: light mist and floor-level steam, fine water droplets, wet reflective surfaces.
LANDMARKS: a tall waterfall on the RIGHT side falling into a dark water channel; the command workstation platform straight
ahead at the far end, reached by a steel staircase.
GRADE: teal shadows / amber highlights, filmic ACES, subtle film grain. Keep this grade identical in every shot.
COMPOSITION: main subject centred; key content inside the central 55% of the width.
EXCLUDE: people, characters, text, letters, numbers, signage, logos, bat symbols, emblems, watermarks, branded vehicles,
cartoon style, plastic look, oversaturated neon, heavy lens flare, motion blur.
```

## 4. KEYFRAMES (stills) → save to `nightfall-src/raw/keyframes/`

Generate one at a time. For each, attach the references listed and paste WORLD BIBLE + the shot text.
Regenerate until it passes the QC list (section 7).

### K1.png — gate closed (first frame of the site)
References: the root file `Cinematic Sci-Fi Vault Entrance.png` (or `nightfall-src/public/film/desktop/f_0000.webp`) — keep its composition.
```
[WORLD BIBLE]
SHOT K1: standing on a wet steel deck 8 meters in front of a massive CLOSED vault blast door set into the cavern rock.
Two heavy steel leaves meet exactly in the centre with a circular locking hub, diagonal reinforcement beams, hazard-striped
panels, two vertical hydraulic pistons on each side, a steel frame with amber light bars above and vertical amber wall lights
on both sides, a thin amber glow line along the centre seam. Steam at the base. Pipes enter from the left; a small waterfall
trickles down the rock on the far right with a railing in the right foreground. Symmetrical, door centred, ~60% of frame width.
Exactly 16:9, 1920x1080 or larger. Sharp, high detail.
```

### K2.png — gate fully open (SAME camera as K1)
References: K1.png.
```
[WORLD BIBLE]
Attached image is the exact same shot. Keep camera position, lens, framing, rock, pipes, lights, railing and waterfall
IDENTICAL, pixel-aligned. Change ONLY the door: both leaves have slid fully sideways into the wall frame, the circular hub
split in two, hydraulic pistons extended. Through the open doorway: a short steel-lined passage, then a vast dark cavern with
warm amber lights far away and faint mist. Warm light spills out across the wet deck with reflections; thicker steam at the
door base. No vehicle, no people. Exactly 16:9, 1920x1080 or larger.
```

### K4.png — catwalk, waterfall, stairs (the "cavern reveal")
References: the current `raw/keyframes/K4.png` (keep its composition — it is the best frame you have) + K1.png for materials.
```
[WORLD BIBLE]
Recreate the attached image at higher resolution and sharper detail, keeping the composition: a long black steel grating
catwalk running straight ahead with railings and amber LED edge strips; dark water on both sides; a tall powerful waterfall
on the RIGHT with white spray and mist; rock wall with pipes and caged amber bulkhead lamps on the LEFT; in the distance a steel
staircase leading up to a raised command platform with a faint glow of monitors. Keep the grade identical to K1.
No vehicle, no people, no text on any screen. Exactly 16:9, 1920x1080 or larger.
```

### K5.png — top of the stairs, workstation ahead (CLEAN PLATE, wide)
References: K4.png (same cavern), K1.png (materials).
```
[WORLD BIBLE]
The camera stands on the raised command platform 3 meters from a heavy industrial computer desk, centred. Dark worn metal
desk with scratches and fine dust, mechanical keyboards, toggle switches, small amber and green indicator LEDs, bundled black
cables, equipment racks on both sides, riveted diamond-plate floor, wet near-black rock wall behind. Above/behind the desk:
ONE large central main monitor (16:9, centred, ~40% of image width) with TWO medium monitors on each side, angled slightly
toward the camera, on steel mounting arms. EVERY monitor is switched on but shows a COMPLETELY BLANK uniform very dark navy
surface with a faint even cyan glow: no graphics, no text, no map, no reflections on the glass, nothing overlapping any
screen, all four corners of every screen sharp and visible. Cool cyan light spills from the screens onto the desk; warm amber
caged lamps at the far left and right edges. No chair occluding the main monitor, no people. Exactly 16:9, 1920x1080 or larger.
```

### K6.png — close-up, perpendicular to the main monitor (CLEAN PLATE, final frame)
References: K5.png (same set, closer).
```
[WORLD BIBLE]
Same workstation as the attached image, camera moved forward to 1.3 meters from the desk, perfectly centred and
perfectly perpendicular to the CENTRAL main monitor, eye level with its centre. The main monitor is flat, rectangular, 16:9,
centred, ~55% of image width; thin black bezel, sharp straight edges, all four corners visible. The side monitors are
visible on both sides, also blank. ALL screens are uniformly dark navy with a faint even cyan glow: NO graphics, NO text, NO
map, NO reflections. Desk edge and keyboard at the bottom of the frame, surroundings slightly soft, main monitor tack-sharp.
No people. Exactly 16:9, 1920x1080 or larger.
```
Tip: if the side monitors are not visible enough in K6, widen the shot a little; the OS panels are placed on ALL THREE monitors.

## 5. CLIPS (video) → save to `nightfall-src/raw/clips/`

Tool: Google Flow / Veo "Frames to video" (first frame + last frame). Settings: **8 s, 1080p, 16:9, audio off**.
Paste WORLD BIBLE first, then the clip text. If only image-to-video is available, use the first frame only and the same text.

| File | First frame | Last frame | Move |
|---|---|---|---|
| `C1.mp4` | K1 | K2 | Locked-off: the gate opens |
| `C2.mp4` | K2 | K4 | Forward dolly through the doorway onto the catwalk |
| `C3.mp4` | K4 | K5 | Forward along the catwalk and up the stairs onto the platform |
| `C4.mp4` | K5 | K6 | Slow push-in to the main monitor |

```
C1: Locked-off static tripod shot, the camera does not move at all. The vault door unlocks: the amber centre seam flares, the
circular hub rotates a quarter turn and splits, locking bolts retract, steam bursts from the base, hydraulic pistons extend and
the two heavy leaves slide slowly and heavily apart, revealing warm light and the cavern beyond. Heavy realistic mechanical motion,
no shaking, no cuts, no new objects, no people, no text. Ends exactly on the last frame.

C2: One continuous smooth forward dolly at slow walking pace, steadicam, constant eye height 1.6 m, looking straight ahead. The camera
passes through the open doorway and the short passage and emerges onto the catwalk as the cavern and the waterfall on the right
are revealed. No rotation, no cuts, no speed changes, no people, no text. Ends exactly on the last frame.

C3: One continuous smooth forward movement along the catwalk (waterfall passing on the right), then climbing the steel staircase,
gentle and stable with no head bob, arriving on the command platform facing the workstation. No cuts, no rotation jumps,
no people, no text. Ends exactly on the last frame.

C4: Slow smooth push-in straight toward the central main monitor, perfectly centred, no rotation, ending perpendicular to the blank
dark screen. The monitors stay uniformly dark and blank the whole time: nothing appears on them. No cuts, no people, no text.
```
The end of each clip must match the start of the next (they share a keyframe). If a clip morphs or drifts, regenerate it; do not try to fix it in code.

## 6. Build the film into the site (run from `nightfall-src/`)

```powershell
# 1. check the files
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of csv=p=0 raw/clips/C1.mp4
# (repeat for C2..C4; expect 1920,1080 and about 8 s each)

# 2. extract frames -> public/film (12 fps by default; lower it if the size warning appears)
npm run film
#   $env:FILM_FPS=10; npm run film     # smaller, still smooth because the player blends frames
#   $env:FILM_QUALITY=70; npm run film # smaller files

# 3. line the live OS up with the new monitors
npm run build
npm run preview        # then open http://localhost:4173/nightfall/calibrate
#   click the 4 corners of each monitor on the final frame (left, centre, right), then "Download screens.json"
#   save it as nightfall-src/public/film/screens.json

# 4. rebuild and verify
npm run build ; npm run typecheck ; npm run test
node scripts/perf-scroll.mjs after-new-film   # smoothness probe
```
Targets: desktop frame set ≤ 30 MB, mobile ≤ 12 MB (the build script warns above 30 MB).

## 7. QC checklist (reject and regenerate if any fails)

- [ ] Every still is exactly 16:9 and at least 1920×1080 (check: `node -e "..."` or any image viewer).
- [ ] Rock, metal, lamps and grade look like one place across K1, K2, K4, K5, K6.
- [ ] Waterfall on the right, pipes on the left, in every shot where they are visible.
- [ ] **No text, logos, bat symbols, people or branded vehicles anywhere.**
- [ ] K5 and K6: every monitor is a clean, flat, uniformly dark rectangle with 4 sharp corners and nothing on it.
- [ ] K2 has the same camera as K1 (flip between them: only the door changes).
- [ ] Clips: no cuts, no melting walls, no sudden jumps; first/last frames match their keyframes.
- [ ] The monitors stay blank for the whole of C4.

## 8. Plan B if the AI video still looks soft or morphs

Use only the stills (K1, K2, K4, K5, K6, which are sharp) and let the site move between them with a depth-style camera push and a
crossfade, driven by the scroll. This is less "film" but always crisp. Ask for it and it will be built.

---

# Master prompt to paste into Antigravity

```
You are working in the repo d:\Nishant_Jain_Cinematic_Portfolio_Final\nishant-portfolio. Read nightfall-src/VISUALS.md completely and follow it.

Task: produce the new cave film assets.
1. Using your image-generation tool, create keyframes K1, K2, K4, K5, K6 exactly as specified in section 4 (use the listed reference images,
   16:9, at least 1920x1080, PNG). Save them to nightfall-src/raw/keyframes/ (overwrite the old K1/K2/K4/K5/K6; leave K3 alone).
   Show me each keyframe and wait for my approval before continuing to the next.
2. For the clips C1-C4 (section 5): if you have a video tool (Veo), generate them with first+last frame at 8 s / 1080p / no audio and
   save to nightfall-src/raw/clips/. If you do not, stop and tell me exactly which files I must generate in Google Flow and with which
   prompt, and do not invent placeholder videos.
3. Verify every file with ffprobe/sharp against the checklist in section 7 and report real numbers (resolution, duration).
4. Do NOT run npm run film, do not edit any file outside nightfall-src/raw/, and do not push anything. I will hand over to Claude Code for
   the build and calibration.
```

---
name: nightfall-ui
description: Design system, rules and workflow for ALL UI work in the Nightfall cave portfolio (nightfall-src, Vite + React + Tailwind v4 + motion). Use this whenever the user wants to build, restyle, polish, animate, speed up or "make proper / premium / smooth" any screen — the OS modules (Home, Projects, Contact …), the HUD over the scroll film, the loading screen, the on-monitor screens, the standalone routes, kit components, or the /kit style guide — and whenever a design asks for stats, numbers, badges or status text, even if they never mention "design system". It carries the tokens, the component inventory, the motion recipes, the truthful-content rules and the verification steps, so read it before touching src/os, src/film, src/ui or src/components.
---

# Nightfall UI

The visitor scrolls a photoreal film into an underground cave and ends at a workstation whose three monitors run a
portfolio OS ("NJ-OS"). Every surface — the HUD over the film, the on-monitor screens, the full OS, the standalone
routes (`/about`, `/projects/*`, `/cv` …) — must feel like one product. Quality bar: Skiper-UI finish (clean type,
tight spacing, springy micro-interactions), in a dark cave palette with warm amber and cool cyan screen glow.
When unsure, remove decoration rather than add it.

If a general UI/UX skill is also installed, use it for generic UX advice; the tokens, components and rules here win.

## Where things stand (read first, it saves you a wrong turn)
- **Tokens/Tailwind**: `src/styles/tokens.css` + `tailwind.css` (theme + utilities only; **Tailwind preflight is OFF**, so
  browser defaults leak: add `list-none` to styled `ul/ol`, set heading/paragraph spacing yourself). Legacy `src/index.css`
  sits in `@layer base`, so utilities beat it; `src/os/os.css` (unlayered, ~900 lines) still beats utilities.
- **Kit** (`src/components/kit/`) and **adapted vendor** (`src/components/ui/`) are built and shown on the unlisted `/kit` page.
- **Not migrated yet**: `src/os/**`, `src/film/ScreenPreview.tsx`, `src/ui/HudOverlay.tsx`, `LoadingScreen.tsx` still use
  inline `style={{…}}` objects with raw hex and legacy `--accent`/`--bg-deep` variables. Migrate one component at a time
  (see "Recipe: restyle a component"); don't mix half old, half new inside one component.
- Real facts live only in `src/content/*.ts` (copied from the CV). Static page tests live in `tests/`.

## Read before you build
`references/tokens.md` (colours, type, spacing, motion timings, z-index) · `references/components.md` (what to use for
what, vendor install notes) · `references/motion.md` (copy-ready motion/react recipes) · `references/checklist.md` (run it
before saying done).

## Stack rules
- Style with Tailwind utilities from the tokens (`bg-bg-1 text-text-2 border-line font-display rounded-card`). No raw hex
  outside `tokens.css` — raw hex defeats the single source of truth and breaks theming.
- Animate with `motion/react` only; no new CSS keyframes except screen effects (scanlines, flicker) in `os.css`.
- Reuse a kit component before writing one; one component per file, typed props, under ~300 lines. `cn()` from `@/lib/utils`.
- Never add a per-component `.css` file.

## Hard rules, and why
1. **Content is factual.** Every string comes from `src/content/*.ts` or is a UI label. A recruiter reads this site, and
   earlier versions shipped invented figures ("4+ years", "98.4%", "TLS 1.3", an uptime gauge) that contradicted the CV.
   If a design wants an impressive number, show a real field instead (`projects.length`, companies from `experiences`,
   the education period, a project's stack/badge) and tell the user you did that. Decorative status text (clock, "online")
   must be labelled `SIMULATED`. Patent wording is always "Patent application filed — not granted".
   `tests/content.spec.ts` fails the build on known inventions; when you meet a new invented claim, add it to its list.
2. No Batman logos, bat symbols, "Batcomputer", "Warden", Tumbler or other official names in UI or assets (IP).
3. One glowing focal accent per view (one amber CTA or one beam); everything else stays quiet, or nothing reads as important.
4. Every animation respects `useReducedMotion()`: reduced = opacity only, ≤ 200 ms, loops stopped.
5. Text ≥ 12 px, body contrast ≥ 4.5:1, touch targets ≥ 44 px, visible focus ring, full keyboard path.
6. Mobile (< 768 px) gets its own layout (bottom tab bar, stacked panels), not a shrunken desktop. Hover/magnetic/cursor
   effects are off on `(pointer: coarse)`.
7. **Performance on the film screens**: the scroll film runs a canvas loop at 60 fps. Never put a per-frame value in React
   state or a zustand field; quantise (progress is stored in 1% steps) and change React state only when the UI actually
   changes. Memoise heavy trees. Measure with `npm run perf` (needs a fresh build) before and after.
   Anything layered over the film canvas must be opaque or plain-alpha: `backdrop-filter` and `mix-blend-mode` over it
   (and over the warped monitor panels) cost about one dropped frame in six, measured. Use solid `bg-bg-0/85` chips.
8. **Monitor panels**: the three on-monitor screens (`src/film/screens/*`) are laid out at a fixed design size and warped
   onto the monitor quads with `matrix3d`. The quads are in the 1600x900 desktop frame, so cover-fit maths must always use
   the desktop size, even when mobile (960x540) frames are playing. Keep outer-edge padding on the side screens, because a
   16:10 viewport crops them. Below 700 px wide the panels are replaced by one tappable card (`film-mobile-card`).

## Workflow
1. Read the references. Grep the code you will touch **and `tests/`** — specs select by class/text (`.hud-overlay`,
   `.audio-toggle-btn`, `.quick-portfolio-btn`, `.access-facility-btn`, `"% FACILITY DEPTH"`, project button labels …).
   Keep those selectors, or change the test in the same commit and say so.
2. Build with kit/ui components. Windows PowerShell: chain with `;`, work from `nightfall-src/`.
3. `npm run typecheck`, `npm run build`, then `npm run test` (tests run against the **built** output via `vite preview`
   on :4173, so rebuild first or you test stale code). Never claim a pass you did not run.
4. `node scripts/ui-shots.mjs <tag>` and LOOK at `tests/__shots__/ui/<tag>/` at 1440, 1366 and 390 px.
5. Go through `references/checklist.md`; report real output.
6. Local commit only. Never `git push`, never edit the root `index.html`/`cave.html`, never hand-edit `../nightfall/` (build output).

## Recipe: restyle a component
Screenshot it (before) → list its real content source → rebuild markup with `Panel`/`Badge`/`MagneticButton`/`SectionHeader`
and token utilities → delete the inline `style` objects and the `os.css` selectors that nothing else uses → typecheck, build,
test → screenshot (after) and compare. Visual change should be intended, not accidental.

## Recipe: add a kit component
Create `src/components/kit/<Name>.tsx` → add it to the `/kit` page (`src/pages/KitPage.tsx`) → cover it in
`tests/kit.spec.ts` (render, interaction, reduced motion) → flip/add its row in `references/components.md`.

## Recipe: add a vendor component
Follow "Install commands" and "Vendor adaptation notes" in `references/components.md` (the shadcn CLI writes a wrong `cn`
import and may skip peer deps). Free components only; never paste paid Skiper UI / Animmaster code.

## /story Editorial Edition Palette & Scoping
The `/story` route hosts an editorial VOX-style portfolio page (GSAP ScrollTrigger + Motion, interactive flashlight beam, puppet string collaboration section). Its palette and design tokens are strictly scoped to `.story` to prevent leaking into the subterranean cave or NJ-OS:
- `--ed-bg: #0b0a09` (near-black background)
- `--ed-ivory: #ece6d8`, `--ed-ivory-2: #b9b2a3` (editorial warm text)
- `--ed-yellow: #f2c230`, `--ed-red: #e2482f`, `--ed-blue: #5a7dff` (accents)
- `--ed-paper: #eae8e2`, `--ed-ink: #0d0d0d` (Hire Me collaboration section)
- Display typography: *Anton* (condensed display headers) & *Instrument Serif* (italic editorial quotes/captions).
- The cave film, HUD, and NJ-OS tokens remain untouched.

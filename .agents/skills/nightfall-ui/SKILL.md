---
name: nightfall-ui
description: Design system and UI rules for the Nightfall cave portfolio (nightfall-src). Use for ANY UI work in nightfall-src — new components, styling, animations, OS modules, HUD, loading screens, on-monitor screens, standalone pages — or when asked to make the UI look better, premium, polished, or "like Skiper UI / Animmaster".
---

# Nightfall UI

The visitor scrolls a photoreal film into an underground cave and ends at a workstation whose monitors
run a portfolio OS ("NJ-OS"). Every UI surface — HUD over the film, the on-monitor screens, the full OS,
and the standalone routes (`/about`, `/projects/*`, `/cv` …) — must feel like one product.

**Identity: "Cave OS, premium."** Physical, dark, warm practical light, cool cyan screen glow, calm and
precise motion. The quality bar is Skiper UI's finish (clean type, tight spacing, springy micro-interactions),
NOT neon cyberpunk. When unsure, remove decoration rather than add it.

If a general UI/UX skill (e.g. ui-ux-pro-max) is also installed, use it for generic UX guidance, but the
tokens, components and rules in THIS skill win for this project.

## Read before you build
1. `references/tokens.md` — colours, type, spacing, radius, shadows, motion timings, z-index.
2. `references/components.md` — which component to use for which need, and how to install vendor ones.
3. `references/motion.md` — copy-ready Motion recipes.
4. `references/checklist.md` — run it before you say a task is done.

## Stack rules
- Styling: Tailwind v4 utilities that map to the tokens in `src/styles/tokens.css`
  (`bg-bg-1`, `text-text-2`, `border-line`, `font-display` …). No raw hex values outside `tokens.css`.
- Animation: `motion/react` only (`motion`, `AnimatePresence`, `useReducedMotion`, `useSpring` …).
  No new CSS keyframes except screen effects (scanlines, flicker) in `src/os/os.css`.
- Components:
  - `src/components/ui/` — vendor (shadcn, Magic UI, Skiper free) components, adapted to the tokens.
  - `src/components/kit/` — our own components (Panel, Badge, MagneticButton, DynamicIsland …).
  - Reuse a kit component before writing a new one. One component = one file, typed props.
- Class merging: `cn()` from `src/lib/utils.ts`.
- Never create a new per-component `.css` file.

## Hard rules (never break)
1. **Content is factual.** All copy comes from `src/content/*.ts`. Never invent numbers, percentages,
   accuracy figures, node counts, protocol versions, clients, dates, links or testimonials. If a design
   "needs a metric", show a real field (stack, status, year) instead. Decorative status text
   (clock, "SYSTEM ONLINE") must be labelled `SIMULATED` / cosmetic.
2. Patent wording is always "Patent application filed — not granted".
3. No Batman logos, bat symbols, or official character names in UI or assets.
4. One glowing focal accent per view (one amber CTA or one beam). Everything else is quiet.
5. Every animation respects `useReducedMotion()` — reduced motion = opacity-only, ≤ 200 ms.
6. Text ≥ 12 px; body contrast ≥ 4.5:1; touch targets ≥ 44 px; visible focus ring on every control.
7. Mobile (< 768 px) gets its own layout (bottom tab bar, stacked panels) — never just scaled down.
8. Cursor/magnetic/hover-only effects are disabled on `(pointer: coarse)`.

## Workflow for any UI task
1. Read the references above.
2. Find the closest existing kit/ui component; extend it if needed.
3. Build. Keep files under ~300 lines; split when larger.
4. `npm run typecheck && npm run build` — fix all errors.
5. `node scripts/ui-shots.mjs` — then actually LOOK at the screenshots in `tests/__shots__/ui/`
   at 1440×900, 1366×768 and 390×844.
6. Go through `references/checklist.md`. Report real command output, never "should work".

## Adding a vendor component
Use the install commands in `references/components.md`. After installing:
- Replace `next/image` → `<img loading="lazy">`, `next/link` → `Link` from `react-router-dom`.
  `"use client"` lines are harmless; remove them for tidiness.
- Replace the vendor's colours with token classes.
- Add `useReducedMotion()` handling if it animates.
- Record it in the inventory table in `references/components.md`.
- Only free components. Never paste code from paid Skiper UI / Animmaster packs.

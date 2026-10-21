# UI done-checklist (run before reporting a UI task complete)

## Build
- [ ] `npm run typecheck` passes (paste output)
- [ ] `npm run build` passes (paste output)
- [ ] `npm run test` passes, or failures are listed honestly
- [ ] `node scripts/ui-shots.mjs` ran and you opened the screenshots at 1440×900, 1366×768, 390×844

## Design
- [ ] Only token utilities; `grep -rn "#[0-9a-fA-F]\{6\}" src --include=*.tsx` shows no new raw hex
- [ ] One focal accent per view (one amber CTA or one beam)
- [ ] Type follows the scale; nothing under 12 px rendered
- [ ] Panels have radius 16, `border-line`, inner top highlight
- [ ] Spacing on the 4-pt scale; aligned edges; no orphan single words in headings at 1366 px

## Motion
- [ ] All animations use `motion/react` and check `useReducedMotion()`
- [ ] With OS "reduce motion" enabled: no movement, only fades
- [ ] Nothing loops forever except cosmetic status dots / screen flicker

## Accessibility & input
- [ ] Tab order logical; visible focus ring on every control
- [ ] Keyboard: `1–8` modules, `⌘K / Ctrl K` palette, `Esc` back/close, Enter activates
- [ ] Touch targets ≥ 44 px; hover-only effects off on `(pointer: coarse)`
- [ ] 390 px wide: no horizontal scroll, bottom tab bar works

## Content (blocking)
- [ ] Every string comes from `src/content/*` or is a UI label
- [ ] `grep -rnE "[0-9]+(\.[0-9]+)?%|TLS 1\.3|Orin|CGPA|nodes" src --include=*.tsx` — every hit is backed by `src/content`
- [ ] Patent = "application filed — not granted"; images captioned "Illustrative artwork" where they are not real screenshots
- [ ] No bat symbols / official character names

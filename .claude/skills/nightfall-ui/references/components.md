# Component inventory — what to use where

Paths are relative to `nightfall-src/src/`. Status: **planned** = not built yet; **ready** = exists.
When you build or install one, flip its status to ready in this table.

| Need | Component | Source (free only) | Status |
|---|---|---|---|
| Glass panel / card shell | `components/kit/Panel.tsx` | own | planned |
| Status pill | `components/kit/Badge.tsx` (tone: accent / ok / warn / muted) | own | planned |
| Keyboard hint | `components/kit/Kbd.tsx` | own | planned |
| Section title block | `components/kit/SectionHeader.tsx` (mono label + display title) | own | planned |
| Heading reveal | `components/kit/TextReveal.tsx` (word-by-word blur-fade) | own | planned |
| Primary / ghost CTA | `components/kit/MagneticButton.tsx` | own (Skiper-style) | planned |
| Morphing status / toast pill | `components/kit/DynamicIsland.tsx` | own (Skiper-style) | planned |
| Project art hover reveal | `components/kit/ImageReveal.tsx` | own (Skiper-style) | planned |
| Desktop cursor | `components/kit/CursorRing.tsx` | own (Animmaster-style) | planned |
| Experience timeline | `components/kit/TracingTimeline.tsx` (scroll-linked line) | own (Aceternity-style) | planned |
| Scramble/decode label | `components/ui/hyper-text.tsx` | Magic UI | planned |
| Rotating roles | `components/ui/word-rotate.tsx` | Magic UI | planned |
| Section fade-in | `components/ui/blur-fade.tsx` | Magic UI | planned |
| Spotlight project card | `components/ui/magic-card.tsx` | Magic UI | planned |
| Single highlight border | `components/ui/border-beam.tsx` | Magic UI | planned |
| Architecture flow lines | `components/ui/animated-beam.tsx` | Magic UI | planned |
| Command palette (⌘K / Ctrl K) | `components/ui/command.tsx` + `dialog.tsx` | shadcn | planned |
| Tabs | `components/ui/tabs.tsx` + Motion `layoutId` underline | shadcn | planned |
| Tooltip | `components/ui/tooltip.tsx` | shadcn | planned |

## Where each surface uses them

- **HUD over film** (`ui/HudOverlay.tsx`): DynamicIsland (scroll hint → section + progress → "Access system"),
  MagneticButton (ghost) for Quick Portfolio / CV / Contact, CursorRing.
- **Loading** (`ui/LoadingScreen.tsx`): hyper-text "NIGHTFALL", real load % count-up, thin accent line.
- **OS shell** (`os/OSShell.tsx`): Panel, Kbd, nav with `layoutId` indicator, command palette, AnimatePresence module switch.
- **Identity**: TextReveal name, word-rotate roles, Panel summary, MagneticButton (primary = View projects).
- **Projects**: magic-card grid, Badge status, ImageReveal (caption "Illustrative artwork — not a product screenshot").
- **Project dossier**: tabs (Overview · Architecture · Stack), animated-beam diagram, tooltip on nodes.
- **Experience**: TracingTimeline.
- **Skills**: chip groups with stagger; hover a skill → highlight projects whose stack contains it.
- **Achievements**: cards; border-beam on exactly one card.
- **Contact**: DynamicIsland toast "Email copied", mailto form.
- **On-monitor screens** (`film/screens/*`): ScreenFrame (scanlines, vignette, glass reflection, glow) + `text-screen` palette.

## Install commands

Verify each URL on the vendor's docs page before running; if it differs, use the docs version and update this file.

```bash
# shadcn primitives
npx shadcn@latest add command dialog tabs tooltip

# Magic UI (free registry)
npx shadcn@latest add "https://magicui.design/r/hyper-text.json"
npx shadcn@latest add "https://magicui.design/r/word-rotate.json"
npx shadcn@latest add "https://magicui.design/r/blur-fade.json"
npx shadcn@latest add "https://magicui.design/r/magic-card.json"
npx shadcn@latest add "https://magicui.design/r/border-beam.json"
npx shadcn@latest add "https://magicui.design/r/animated-beam.json"

# Skiper UI — FREE items only, using the exact command shown on that component's page
npx shadcn@latest add @skiper-ui/<id>
```

## 21st.dev (community registry)
- Browse https://21st.dev/community/components (heroes, buttons, inputs, dialogs, cards, shaders, gradients).
  Components are shadcn-registry format: copy the install command shown on each component page, e.g.
  `npx shadcn@latest add "<url from the component page>"`.
- Free tier = 2 component copies per day; more needs a paid membership. License terms for community
  components are NOT stated on the site, so: check the component page's author/licence note before using,
  and prefer our own kit or Magic UI when a component already exists there.
- Treat 21st.dev as a source of patterns for: buttons, inputs/forms, dialogs, pricing-free hero sections
  and shaders. Do not copy paid/"premium" templates.
- Optional MCP/CLI: `npx @21st-dev/cli@latest init --client claude` (writes agent config — user runs it).

## Motion AI Kit (animation help for agents)
- `npx motion-ai` (interactive: choose scope = project, agents = Claude Code and/or Gemini CLI). It adds a
  `/motion` skill and Motion's free docs-search MCP. No token needed for the free tier. The user runs it;
  agents must not run it non-interactively.
- Once installed, use `/motion` for animation questions; still follow `motion.md` recipes and the
  reduced-motion rule.

Vendor components often import `framer-motion` or `motion/react`. We use `motion` (v12): change
`from "framer-motion"` → `from "motion/react"`.

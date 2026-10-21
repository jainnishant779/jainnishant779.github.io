# Design tokens

Source of truth: `nightfall-src/src/styles/tokens.css` (CSS variables) mapped into Tailwind via `@theme`.
Use the Tailwind utility in components; use `var(--token)` only inside `tokens.css` / `os.css`.

## Colour

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--bg-0` | `#050607` | `bg-bg-0` | page background |
| `--bg-1` | `#0a0c0f` | `bg-bg-1` | panels |
| `--bg-2` | `#10141a` | `bg-bg-2` | raised / hover |
| `--glass` | `rgba(14,17,21,.62)` | `bg-glass` + `backdrop-blur-[14px]` | HUD, floating panels |
| `--line` | `rgba(255,255,255,.06)` | `border-line` | default borders |
| `--line-strong` | `rgba(255,255,255,.12)` | `border-line-strong` | hover / active borders |
| `--accent` | `#e8a23a` | `text-accent`, `bg-accent` | the ONE focal CTA, active nav |
| `--accent-soft` | `rgba(232,162,58,.14)` | `bg-accent-soft` | active backgrounds, badges |
| `--screen` | `#8fdcff` | `text-screen` | text ON the cave monitors only |
| `--screen-glow` | `rgba(80,180,255,.18)` | — | monitor glow shadows |
| `--ok` | `#7fb38a` | `text-ok` | status: live / done |
| `--warn` | `#e8c23a` | `text-warn` | status: in progress |
| `--danger` | `#e5674f` | `text-danger` | errors only |
| `--text-1` | `#ece8de` | `text-text-1` | headings, primary text |
| `--text-2` | `#a9a497` | `text-text-2` | body, descriptions |
| `--text-3` | `#6f6b61` | `text-text-3` | meta labels (never body copy) |

## Typography

| Role | Font | Size / line-height | Weight | Tracking |
|---|---|---|---|---|
| Display | Space Grotesk (`font-display`) | `clamp(2.5rem, 6vw, 4.75rem)` / 1.0 | 600 | −0.03em |
| H1 | Space Grotesk | 2.25rem / 1.1 | 600 | −0.02em |
| H2 | Space Grotesk | 1.5rem / 1.2 | 600 | −0.01em |
| H3 | Space Grotesk | 1.125rem / 1.3 | 500 | 0 |
| Body | Inter (`font-body`) | 1rem / 1.65 | 400 | 0 |
| Small | Inter | 0.875rem / 1.55 | 400 | 0 |
| Label | JetBrains Mono (`font-mono`) | 0.72rem / 1.2, UPPERCASE | 500 | 0.14em |
| Data | JetBrains Mono | 0.8125rem / 1.4 | 400 | 0 |

Minimum rendered size 12 px (labels are 0.72rem ≈ 11.5 px → use 0.75rem on mobile).

## Shape & depth

| Token | Value |
|---|---|
| Radius chip / button / card | 6px / 10px / 16px (`rounded-[6px]`, `rounded-[10px]`, `rounded-2xl`) |
| `--shadow-panel` | `0 20px 60px -20px rgba(0,0,0,.8)` |
| `--hl-top` | `inset 0 1px 0 rgba(255,255,255,.06)` (inner top highlight on every panel) |
| Focal glow | `0 0 0 1px rgba(232,162,58,.5), 0 0 24px rgba(232,162,58,.25)` |

## Spacing
4-pt scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. Panel padding 24 (desktop) / 16 (mobile).
Section gap 48. Grid gap 16. Max content width 1200px.

## Motion

| Kind | Duration | Easing |
|---|---|---|
| Micro (press, toggle) | 120 ms | `cubic-bezier(.16,1,.3,1)` |
| Hover | 220 ms | same |
| Panel / module switch | 420 ms | same |
| Camera / zoom into monitor | 800 ms | `cubic-bezier(.65,0,.35,1)` |
| UI spring | — | `{ type: 'spring', stiffness: 380, damping: 30 }` |
| Large spring | — | `{ type: 'spring', stiffness: 140, damping: 22 }` |
| Stagger | 0.04 s per child, max 12 children animated |

## z-index
film canvas 0 · on-monitor screens 10 · HUD 50 · OS overlay 100 · command palette 200 · toast 300 · cursor 400.

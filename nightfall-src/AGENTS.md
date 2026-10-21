# Agent instructions — nightfall-src

- For ANY UI work here, first read `../.claude/skills/nightfall-ui/SKILL.md` and its `references/` (tokens, components, motion, checklist). Mandatory.
- Portfolio copy comes only from `src/content/*.ts`. Never invent metrics, numbers, clients, links or projects.
- Style with Tailwind utilities mapped to `src/styles/tokens.css`; animate with `motion/react`; respect `useReducedMotion()`.
- Verify with `npm run typecheck && npm run build && npm run test`, then `node scripts/ui-shots.mjs <tag>` and look at the screenshots.
- Never `git push`. Never edit files outside `nightfall-src/`.

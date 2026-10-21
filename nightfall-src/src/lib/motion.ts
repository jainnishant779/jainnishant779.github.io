// Shared motion constants — values come from .claude/skills/nightfall-ui/references/tokens.md
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_CAMERA = [0.65, 0, 0.35, 1] as const;

export const SPRING_UI = { type: 'spring', stiffness: 380, damping: 30 } as const;
export const SPRING_LARGE = { type: 'spring', stiffness: 140, damping: 22 } as const;

export const DUR = { micro: 0.12, hover: 0.22, panel: 0.42, camera: 0.8 } as const;

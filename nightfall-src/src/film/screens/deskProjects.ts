import { projects } from '@/content/projects';

export interface DeskProject {
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  stack: string[];
  keyNum: string;
}

// Order and short labels of the desk-console buttons. Titles, badges and stacks come from src/content/projects.ts.
const ORDER: { slug: string; shortTitle: string }[] = [
  { slug: 'poultry-health-ai', shortTitle: 'POULTRY HEALTH AI' },
  { slug: 'edgedesk', shortTitle: 'EDGEDESK REMOTE ACCESS' },
  { slug: 'facial-attendance', shortTitle: 'FACIAL RECOGNITION AI' },
  { slug: 'crowd-analytics', shortTitle: 'CROWD ANALYTICS & STAMPEDE' },
  { slug: 'on-device-ai', shortTitle: 'ON-DEVICE AI ASSISTANT' },
];

export const DESK_PROJECTS: DeskProject[] = ORDER.flatMap(({ slug, shortTitle }, i) => {
  const p = projects.find((proj) => proj.slug === slug);
  return p ? [{ slug, title: p.title, shortTitle, badge: p.badge, stack: p.stack, keyNum: String(i + 1) }] : [];
});

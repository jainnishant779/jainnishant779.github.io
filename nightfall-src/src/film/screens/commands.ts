import { profile, education } from '@/content/profile';
import { projects as contentProjects } from '@/content/projects';
import { experiences } from '@/content/experience';
import { skillGroups } from '@/content/skills';
import { achievements, certifications } from '@/content/achievements';
import { getCVUrl } from '@/lib/assets';
import { DESK_PROJECTS } from './deskProjects';

// Numbered like the desk-strip buttons ([1]..[5]), so `open 2` and button [2] are the same project.
const projects = [...contentProjects].sort(
  (a, b) => (DESK_PROJECTS.findIndex((d) => d.slug === a.slug) + 1 || 99) - (DESK_PROJECTS.findIndex((d) => d.slug === b.slug) + 1 || 99),
);

/**
 * The on-monitor terminal. Pure functions: a command in, lines (and optionally one action) out.
 * Everything printed comes from src/content (the CV). Do not invent facts here.
 */
export type LineKind = 'out' | 'dim' | 'err' | 'accent';

export type Action =
  | { type: 'open-project'; slug: string }
  | { type: 'link'; href: string }
  | { type: 'clear' };

export interface Line {
  kind: LineKind;
  text: string;
  /** Clicking the line runs this action (used for project names and links). */
  action?: Action;
}

export interface CommandResult {
  lines: Line[];
  action?: Action;
}

export const PROMPT = 'visitor@nightfall:~$';

export const COMMANDS: { name: string; help: string }[] = [
  { name: 'help', help: 'list the commands' },
  { name: 'whoami', help: 'who is Nishant' },
  { name: 'neofetch', help: 'a quick fact sheet' },
  { name: 'about', help: 'professional summary' },
  { name: 'projects', help: 'list the projects' },
  { name: 'open', help: 'open <number|name> a project on the main screen' },
  { name: 'skills', help: 'skills by group' },
  { name: 'experience', help: 'roles and companies' },
  { name: 'achievements', help: 'awards, patent status, certifications' },
  { name: 'contact', help: 'email, GitHub, LinkedIn' },
  { name: 'cv', help: 'open the CV (PDF)' },
  { name: 'ls', help: 'what is in this directory' },
  { name: 'clear', help: 'clear the screen' },
];

const out = (text: string, kind: LineKind = 'out', action?: Action): Line => ({ kind, text, action });

function pad(s: string, n: number) {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

/** Finds a project by 1-based number, slug, or part of its title. */
export function findProject(arg: string) {
  const q = arg.trim().toLowerCase();
  if (!q) return undefined;
  const n = Number(q);
  if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1];
  return (
    projects.find((p) => p.slug === q) ??
    projects.find((p) => p.slug.includes(q)) ??
    projects.find((p) => p.title.toLowerCase().includes(q))
  );
}

/** Completion candidates for the word being typed. */
export function complete(input: string): string[] {
  const [first, ...rest] = input.trimStart().split(/\s+/);
  if (rest.length === 0) return COMMANDS.map((c) => c.name).filter((n) => n.startsWith(first.toLowerCase()) && n !== first);
  if (first === 'open') {
    const q = rest.join(' ').toLowerCase();
    return projects.map((p) => p.slug).filter((s) => s.startsWith(q) && s !== q);
  }
  return [];
}

export function runCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmdRaw, ...args] = input.split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const rest = args.join(' ');

  switch (cmd) {
    case 'help':
      return {
        lines: [
          out('Commands:', 'accent'),
          ...COMMANDS.map((c) => out(`  ${pad(c.name, 13)} ${c.help}`)),
          out('Tip: Tab completes, ↑ ↓ walk your history.', 'dim'),
        ],
      };

    case 'whoami':
      return {
        lines: [
          out(profile.name, 'accent'),
          out(profile.title),
          out(profile.location, 'dim'),
          out(`"${profile.tagline}"`, 'dim'),
        ],
      };

    case 'neofetch': {
      const companies = new Set(experiences.map((e) => e.company.replace(/ Pvt\. Ltd\./, '')));
      const rows: [string, string][] = [
        ['Name', profile.name],
        ['Role', profile.title.split(' · ')[0]],
        ['Focus', profile.title.split(' · ').slice(1).join(', ')],
        ['Location', profile.location],
        ['Degree', `${education.degree.replace(' (Integrated)', '')} (${education.period})`],
        ['Companies', [...companies].join(', ')],
        ['Projects', String(projects.length)],
        ['Patent', 'application filed — not granted'],
      ];
      return { lines: rows.map(([k, v]) => out(`${pad(k, 10)} ${v}`, k === 'Name' ? 'accent' : 'out')) };
    }

    case 'about':
      return { lines: [out(profile.summary)] };

    case 'projects':
      return {
        lines: [
          ...projects.map((p, i) =>
            out(`${pad(String(i + 1), 3)}${pad(p.title.split(':')[0].replace(/^AI-(Powered|Accelerated) /, ''), 38)}${p.badge}`, 'out', {
              type: 'open-project',
              slug: p.slug,
            }),
          ),
          out('Type "open <number>" to load one on the main screen.', 'dim'),
        ],
      };

    case 'open': {
      const p = findProject(rest);
      if (!p) return { lines: [out(`open: no project matches "${rest}". Try "projects".`, 'err')] };
      return { lines: [out(`opening ${p.title} …`, 'dim')], action: { type: 'open-project', slug: p.slug } };
    }

    case 'skills':
      return {
        lines: skillGroups.flatMap((g) => [
          out(g.group + (g.note ? `  (${g.note})` : ''), 'accent'),
          out('  ' + g.skills.join(' · ')),
        ]),
      };

    case 'experience':
      return {
        lines: experiences.flatMap((e) => [
          out(`${e.role} — ${e.company}`, 'accent'),
          out(`  ${e.location} · ${e.period}`, 'dim'),
        ]),
      };

    case 'achievements':
      return {
        lines: [
          ...achievements.map((a) => out(`★ ${a.title}${a.detail ? ` (${a.detail})` : ''}`)),
          out('Certifications & training', 'accent'),
          ...certifications.map((c) => out(`  ${c.title} — ${c.issuer}`)),
        ],
      };

    case 'contact':
      return {
        lines: [
          out(`Email     ${profile.email}`, 'out', { type: 'link', href: `mailto:${profile.email}` }),
          out(`GitHub    ${profile.github.replace('https://', '')}`, 'out', { type: 'link', href: profile.github }),
          out(`LinkedIn  ${profile.linkedin.replace('https://', '')}`, 'out', { type: 'link', href: profile.linkedin }),
          out(`Location  ${profile.location}`, 'dim'),
        ],
      };

    case 'cv':
      return { lines: [out('opening the CV (PDF) in a new tab …', 'dim')], action: { type: 'link', href: getCVUrl() } };

    case 'github':
      return { lines: [out('opening GitHub …', 'dim')], action: { type: 'link', href: profile.github } };
    case 'linkedin':
      return { lines: [out('opening LinkedIn …', 'dim')], action: { type: 'link', href: profile.linkedin } };
    case 'email':
      return { lines: [out(`opening your mail app for ${profile.email} …`, 'dim')], action: { type: 'link', href: `mailto:${profile.email}` } };

    case 'ls':
      return { lines: [out('projects/  skills/  experience/  achievements/  contact/  cv.pdf')] };
    case 'pwd':
      return { lines: [out('/home/visitor/nightfall')] };

    case 'clear':
      return { lines: [], action: { type: 'clear' } };

    case 'sudo':
      if (rest.toLowerCase().startsWith('hire')) {
        return {
          lines: [
            out('[sudo] password for visitor: ********', 'dim'),
            out('permission granted. The best next step is an email:', 'accent'),
            out(`  ${profile.email}`, 'out', { type: 'link', href: `mailto:${profile.email}` }),
          ],
        };
      }
      return { lines: [out('visitor is not in the sudoers file. This incident will not be reported.', 'err')] };

    default:
      return { lines: [out(`command not found: ${cmdRaw}. Type "help".`, 'err')] };
  }
}

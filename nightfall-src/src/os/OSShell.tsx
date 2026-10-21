import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { Briefcase, FileText, FlaskConical, History, Home, Map as MapIcon, Radio, Search, Trophy, User, Zap, type LucideIcon } from 'lucide-react';
import './os.css';
import { Identity } from './modules/Identity';
import { Projects } from './modules/Projects';
import { ExperienceArchive } from './modules/ExperienceArchive';
import { Skills } from './modules/Skills';
import { Achievements } from './modules/Achievements';
import { Dossier } from './modules/Dossier';
import { Contact } from './modules/Contact';
import { Architecture } from './modules/Architecture';
import { CaveMap } from './modules/CaveMap';
import { OSHome } from './OSHome';
import { CommandPalette } from './CommandPalette';
import { DynamicIsland } from '@/components/kit/DynamicIsland';
import { Kbd } from '@/components/kit/Kbd';
import { cn } from '@/lib/utils';
import { EASE_OUT, SPRING_UI } from '@/lib/motion';
import { sound } from '../lib/sound';

export type OSModuleId =
  | 'home'
  | 'identity'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'achievements'
  | 'dossier'
  | 'contact'
  | 'architecture'
  | 'map';

interface OSShellProps {
  mode?: 'standalone' | 'overlay';
  initialModule?: OSModuleId;
  initialSlug?: string;
  onClose?: () => void;
  onNavigateRoute?: (path: string) => void;
}

interface ModuleDef {
  id: OSModuleId;
  num: string;
  label: string;
  icon: LucideIcon;
  key?: string;
}

const HOME: ModuleDef = { id: 'home', num: '00', label: 'HOME', icon: Home };

const MODULES: ModuleDef[] = [
  { id: 'identity', num: '01', label: 'ABOUT', icon: User, key: '1' },
  { id: 'projects', num: '02', label: 'PROJECTS', icon: Briefcase, key: '2' },
  { id: 'experience', num: '03', label: 'EXPERIENCE', icon: History, key: '3' },
  { id: 'skills', num: '04', label: 'SKILLS', icon: Zap, key: '4' },
  { id: 'achievements', num: '05', label: 'ACHIEVEMENTS', icon: Trophy, key: '5' },
  { id: 'architecture', num: '06', label: 'SYSTEMS LAB', icon: FlaskConical, key: '6' },
  { id: 'contact', num: '07', label: 'CONTACT', icon: Radio, key: '7' },
  { id: 'dossier', num: '08', label: 'CV DOSSIER', icon: FileText, key: '8' },
  { id: 'map', num: '09', label: 'CAVE MAP', icon: MapIcon, key: '9' },
];

/** Standalone route for each module, so every module has a shareable URL and survives a refresh. */
function routeFor(moduleId: OSModuleId, slug?: string): string {
  switch (moduleId) {
    case 'home':
      return '/os';
    case 'identity':
      return '/about';
    case 'dossier':
      return '/cv';
    case 'projects':
      return slug ? `/projects/${slug}` : '/projects';
    default:
      return `/${moduleId}`;
  }
}

export const OSShell: React.FC<OSShellProps> = ({
  mode = 'standalone',
  initialModule = 'home',
  initialSlug,
  onClose,
  onNavigateRoute,
}) => {
  const reduce = useReducedMotion();
  const [activeModule, setActiveModule] = useState<OSModuleId>(initialModule);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | undefined>(initialSlug);
  const [timeStr, setTimeStr] = useState<string>('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteOpenRef = useRef(false);
  paletteOpenRef.current = paletteOpen;
  const [toast, setToast] = useState<string | null>(null);

  // Clock in IST / System time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
          ' // ' +
          now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // On phones the module rail is a horizontal bar: keep the active tab in view.
  useEffect(() => {
    document
      .querySelector<HTMLElement>('.os-rail .os-nav-btn[aria-current="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [activeModule, reduce]);

  // Sync prop changes
  useEffect(() => {
    if (initialModule) setActiveModule(initialModule);
  }, [initialModule]);

  useEffect(() => {
    if (initialSlug) setSelectedProjectSlug(initialSlug);
  }, [initialSlug]);

  const navigateTo = useCallback(
    (moduleId: OSModuleId, slug?: string) => {
      sound.playUiClick();
      setActiveModule(moduleId);
      setSelectedProjectSlug(slug);
      if (mode === 'standalone' && onNavigateRoute) onNavigateRoute(routeFor(moduleId, slug));
    },
    [mode, onNavigateRoute],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sound.playUiClick();
        setPaletteOpen((open) => !open);
        return;
      }
      if (paletteOpenRef.current) return; // the palette owns Esc, arrows and digits while it is open

      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Escape') {
        sound.playUiClick();
        if (selectedProjectSlug) {
          setSelectedProjectSlug(undefined);
        } else if (mode === 'overlay' && onClose) {
          onClose();
        }
        return;
      }

      const match = MODULES.find((m) => m.key === e.key);
      if (match) {
        e.preventDefault();
        sound.playTerminalKey();
        navigateTo(match.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onClose, selectedProjectSlug, navigateTo]);

  const navItem = (mod: ModuleDef) => {
    const active = activeModule === mod.id;
    const Icon = mod.icon;
    return (
      <li key={mod.id} className="os-nav-item">
        <button
          type="button"
          role="tab"
          aria-selected={active}
          aria-current={active ? 'true' : undefined}
          onClick={() => navigateTo(mod.id)}
          className={cn(
            'os-nav-btn relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-ctl border border-transparent px-3 py-2 text-left font-mono text-[0.8rem] whitespace-nowrap transition-colors duration-[220ms]',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
            active ? 'text-accent' : 'text-text-2 hover:bg-bg-2 hover:text-text-1',
          )}
        >
          {active && (
            <motion.span
              layoutId="os-nav-active"
              transition={reduce ? { duration: 0 } : SPRING_UI}
              className="absolute inset-0 -z-0 rounded-ctl border border-accent/50 bg-accent-soft shadow-[inset_3px_0_0_var(--accent),0_0_15px_rgba(232,162,58,0.12)]"
              aria-hidden
            />
          )}
          <Icon className="relative size-4 shrink-0" aria-hidden />
          <span className={cn('os-nav-index relative w-6 text-[0.7rem]', active ? 'font-bold text-accent' : 'text-text-3')}>{mod.num}</span>
          <span className="relative">{mod.label}</span>
        </button>
      </li>
    );
  };

  return (
    <div className={`os-container ${mode === 'overlay' ? 'overlay' : ''}`}>
      <header
        className="flex h-11 min-h-11 items-center justify-between gap-2 border-b border-line bg-bg-1 px-3 font-mono text-[0.8rem] text-text-2 select-none sm:px-5"
        role="banner"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-[26px] shrink-0 items-center justify-center rounded-chip border-[1.5px] border-accent bg-accent-soft font-display text-base font-extrabold text-accent shadow-[0_0_10px_rgba(232,162,58,0.35)]">
            N
          </div>
          <div className="flex min-w-0 items-center gap-2 font-bold tracking-[0.04em] text-text-1">
            <span className="truncate">NJ-OS // NISHANT JAIN</span>
            <span className="hidden text-[0.72rem] font-normal text-text-3 lg:inline">// AI/ML ENGINEER</span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-chip border border-ok/25 bg-ok/10 px-2 py-0.5 text-[0.7rem] text-ok md:inline-flex">
            <span className="size-1.5 rounded-full bg-ok shadow-[0_0_6px_var(--ok)]" aria-hidden />
            SIMULATED INTERFACE
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex min-h-9 cursor-pointer items-center gap-2 rounded-ctl border border-line-strong bg-bg-2 px-2.5 text-text-2 transition-colors duration-[220ms] hover:border-accent/50 hover:text-text-1"
            aria-label="Open command palette"
            title="Command palette (Ctrl+K)"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <Kbd className="hidden sm:inline-flex">Ctrl K</Kbd>
          </button>

          <span className="hidden font-semibold text-accent xl:inline" aria-label="System Time">
            {timeStr}
          </span>

          {mode === 'overlay' && onClose && (
            <button
              className="os-close-btn"
              onClick={onClose}
              title="Close OS Overlay and return to 3D Cave (Esc)"
              aria-label="Back to 3D Cave"
            >
              <span className="hidden sm:inline">← RETURN TO 3D CAVE [ESC]</span>
              <span className="sm:hidden">← CAVE</span>
            </button>
          )}

          {mode === 'standalone' && (
            <a href="/nightfall/" className="os-close-btn" title="Enter 3D Cave Experience" style={{ textDecoration: 'none' }}>
              <span className="hidden sm:inline">ENTER 3D CAVE ↗</span>
              <span className="sm:hidden">CAVE ↗</span>
            </a>
          )}
        </div>
      </header>

      <div className="os-body">
        <nav className="os-rail" aria-label="System Modules Navigation">
          <LayoutGroup id="os-nav">
            <ul className="os-nav-list" role="tablist">
              {navItem(HOME)}
              {MODULES.map(navItem)}
            </ul>
          </LayoutGroup>

          <div className="os-rail-footer">
            <div className="rounded-ctl border border-line-strong bg-bg-2/70 px-3 py-2 font-mono text-[0.68rem]">
              <div className="flex justify-between text-[0.6rem] text-text-3">
                <span>LOCATION:</span>
                <span className="text-ok">● ONLINE</span>
              </div>
              <div className="mt-0.5 font-bold text-screen">INDORE, MP, INDIA</div>
            </div>
            <div className="flex items-center gap-2 text-[0.7rem]">
              <Kbd>1-9</Kbd>
              <span>Quick switch</span>
            </div>
            <div className="flex items-center gap-2 text-[0.7rem]">
              <Kbd>Ctrl K</Kbd>
              <span>Search everything</span>
            </div>
            <div className="flex items-center gap-2 text-[0.7rem]">
              <Kbd>Esc</Kbd>
              <span>{mode === 'overlay' ? 'Exit overlay' : 'Back'}</span>
            </div>
          </div>
        </nav>

        <main className="os-viewport" role="main" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeModule}
              initial={reduce ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? undefined : { opacity: 0, y: -4, filter: 'blur(4px)' }}
              transition={{ duration: reduce ? 0 : 0.24, ease: EASE_OUT }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {activeModule === 'home' && <OSHome onSelectModule={navigateTo} />}

              {activeModule === 'identity' && <Identity onNavigate={navigateTo} />}

              {activeModule === 'projects' && (
                <Projects
                  selectedSlug={selectedProjectSlug}
                  onSelectProject={(slug) => setSelectedProjectSlug(slug)}
                  onClearSelection={() => setSelectedProjectSlug(undefined)}
                />
              )}

              {activeModule === 'experience' && <ExperienceArchive />}

              {activeModule === 'skills' && <Skills />}

              {activeModule === 'achievements' && <Achievements />}

              {activeModule === 'dossier' && <Dossier />}

              {activeModule === 'contact' && <Contact />}

              {activeModule === 'architecture' && <Architecture />}

              {activeModule === 'map' && (
                <CaveMap onReturnToCave={onClose ? onClose : () => { window.location.href = '/nightfall/'; }} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        modules={[HOME, ...MODULES].map(({ id, label, icon, key }) => ({ id, label, icon, key }))}
        onNavigate={navigateTo}
        onClose={mode === 'overlay' ? onClose : undefined}
        onNotify={setToast}
      />

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-[300] flex justify-center md:bottom-6">
          <DynamicIsland stateKey={toast}>
            <span className="font-mono text-[0.8rem]">{toast}</span>
          </DynamicIsland>
        </div>
      )}
    </div>
  );
};

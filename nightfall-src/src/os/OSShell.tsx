import React, { useState, useEffect, useCallback } from 'react';
import './os.css';
import { Identity } from './modules/Identity';
import { Projects } from './modules/Projects';
import { ExperienceArchive } from './modules/ExperienceArchive';
import { Skills } from './modules/Skills';
import { Achievements } from './modules/Achievements';
import { Dossier } from './modules/Dossier';
import { Contact } from './modules/Contact';
import { Architecture } from './modules/Architecture';
import { OSHome } from './OSHome';
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
  | 'architecture';

interface OSShellProps {
  mode?: 'standalone' | 'overlay';
  initialModule?: OSModuleId;
  initialSlug?: string;
  onClose?: () => void;
  onNavigateRoute?: (path: string) => void;
}

const MODULES: { id: OSModuleId; num: string; label: string; key: string }[] = [
  { id: 'identity', num: '01', label: 'IDENTITY', key: '1' },
  { id: 'projects', num: '02', label: 'PROJECTS', key: '2' },
  { id: 'experience', num: '03', label: 'EXPERIENCE', key: '3' },
  { id: 'skills', num: '04', label: 'SKILLS', key: '4' },
  { id: 'achievements', num: '05', label: 'ACHIEVEMENTS', key: '5' },
  { id: 'dossier', num: '06', label: 'DOSSIER / CV', key: '6' },
  { id: 'contact', num: '07', label: 'CONTACT', key: '7' },
  { id: 'architecture', num: '08', label: 'ARCHITECTURE', key: '8' },
];

export const OSShell: React.FC<OSShellProps> = ({
  mode = 'standalone',
  initialModule = 'identity',
  initialSlug,
  onClose,
  onNavigateRoute,
}) => {
  const [activeModule, setActiveModule] = useState<OSModuleId>(initialModule);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | undefined>(
    initialSlug
  );
  const [timeStr, setTimeStr] = useState<string>('');

  // Clock in IST / System time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

      if (mode === 'standalone' && onNavigateRoute) {
        if (moduleId === 'home') {
          onNavigateRoute('/os');
        } else if (moduleId === 'projects' && slug) {
          onNavigateRoute(`/projects/${slug}`);
        } else if (moduleId === 'identity') {
          onNavigateRoute('/about');
        } else if (moduleId === 'dossier') {
          onNavigateRoute('/cv');
        } else {
          onNavigateRoute(`/${moduleId}`);
        }
      }
    },
    [mode, onNavigateRoute]
  );

  // Keyboard navigation: 1-8 switch modules, Esc closes or goes back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

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

  return (
    <div className={`os-container ${mode === 'overlay' ? 'overlay' : ''}`}>
      {/* Top Status Bar */}
      <header className="os-topbar" role="banner">
        <div className="os-topbar-left">
          <div className="os-brand">
            <div className="os-glyph" aria-hidden="true" />
            <span>NJ-OS // v1.0.4</span>
          </div>
          <div className="os-status-badge">
            <span className="os-status-dot" aria-hidden="true" />
            <span>SYS OK</span>
          </div>
          <span className="os-cosmetic-tag" title="System telemetry indicator (cosmetic)">
            [SIMULATED STATUS]
          </span>
        </div>

        <div className="os-topbar-right">
          <span className="os-clock" aria-label="System Time">
            {timeStr}
          </span>

          {mode === 'overlay' && onClose && (
            <button
              className="os-close-btn"
              onClick={onClose}
              title="Close OS Overlay and return to 3D Cave (Esc)"
              aria-label="Back to 3D Cave"
            >
              ← BACK TO CAVE [ESC]
            </button>
          )}

          {mode === 'standalone' && (
            <a
              href="/nightfall/"
              className="os-close-btn"
              title="Enter 3D Cave Experience"
              style={{ textDecoration: 'none' }}
            >
              ENTER 3D CAVE ↗
            </a>
          )}
        </div>
      </header>

      {/* Main OS Body */}
      <div className="os-body">
        {/* Navigation Rail / Bottom Tab Bar */}
        <nav className="os-rail" aria-label="System Modules Navigation">
          <ul className="os-nav-list" role="tablist">
            <li className="os-nav-item">
              <button
                className="os-nav-btn"
                role="tab"
                aria-selected={activeModule === 'home'}
                aria-current={activeModule === 'home' ? 'true' : undefined}
                onClick={() => navigateTo('home')}
              >
                <span className="os-nav-index">00</span>
                <span>OVERVIEW</span>
              </button>
            </li>

            {MODULES.map((mod) => (
              <li key={mod.id} className="os-nav-item">
                <button
                  className="os-nav-btn"
                  role="tab"
                  aria-selected={activeModule === mod.id}
                  aria-current={activeModule === mod.id ? 'true' : undefined}
                  onClick={() => navigateTo(mod.id)}
                >
                  <span className="os-nav-index">{mod.num}</span>
                  <span>{mod.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="os-rail-footer">
            <div className="os-shortcut-legend">
              <span className="os-key">1-8</span>
              <span>Quick switch</span>
            </div>
            <div className="os-shortcut-legend">
              <span className="os-key">ESC</span>
              <span>{mode === 'overlay' ? 'Exit overlay' : 'Back'}</span>
            </div>
          </div>
        </nav>

        {/* Viewport Panels */}
        <main className="os-viewport" role="main" tabIndex={-1}>
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
        </main>
      </div>
    </div>
  );
};

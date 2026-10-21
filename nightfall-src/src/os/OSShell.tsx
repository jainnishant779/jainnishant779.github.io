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
import { CaveMap } from './modules/CaveMap';
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
  | 'architecture'
  | 'map';

interface OSShellProps {
  mode?: 'standalone' | 'overlay';
  initialModule?: OSModuleId;
  initialSlug?: string;
  onClose?: () => void;
  onNavigateRoute?: (path: string) => void;
}

const MODULES: { id: OSModuleId; num: string; label: string; icon: string; key: string }[] = [
  { id: 'identity', num: '01', label: 'ABOUT', icon: '👤', key: '1' },
  { id: 'projects', num: '02', label: 'PROJECTS', icon: '💼', key: '2' },
  { id: 'experience', num: '03', label: 'EXPERIENCE', icon: '📜', key: '3' },
  { id: 'skills', num: '04', label: 'SKILLS', icon: '⚡', key: '4' },
  { id: 'achievements', num: '05', label: 'ACHIEVEMENTS', icon: '🏆', key: '5' },
  { id: 'architecture', num: '06', label: 'SYSTEMS LAB', icon: '🔬', key: '6' },
  { id: 'contact', num: '07', label: 'CONTACT', icon: '📡', key: '7' },
  { id: 'dossier', num: '08', label: 'CV DOSSIER', icon: '📄', key: '8' },
  { id: 'map', num: '09', label: 'CAVE MAP', icon: '🗺️', key: '9' },
];

export const OSShell: React.FC<OSShellProps> = ({
  mode = 'standalone',
  initialModule = 'home',
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
        now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
        ' // ' +
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
        })
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
        } else if (moduleId === 'architecture') {
          onNavigateRoute('/skills');
        } else {
          onNavigateRoute(`/${moduleId}`);
        }
      }
    },
    [mode, onNavigateRoute]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      {/* Top Status Bar Matching Reference Images */}
      <header className="os-topbar" role="banner">
        <div className="os-topbar-left">
          {/* Serif Golden 'N' Monogram */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '3px',
              border: '1.5px solid #e8a23a',
              backgroundColor: 'rgba(232, 162, 58, 0.15)',
              color: '#e8a23a',
              fontFamily: "'Space Grotesk', serif",
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(232, 162, 58, 0.35)',
              flexShrink: 0,
            }}
          >
            N
          </div>

          <div className="os-brand">
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>NJ-OS // NISHANT JAIN</span>
            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>// AI/ML ENGINEER</span>
          </div>

          <div className="os-status-badge">
            <span className="os-status-dot" aria-hidden="true" />
            <span>SIMULATED INTERFACE</span>
          </div>
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
              ← RETURN TO 3D CAVE [ESC]
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
        {/* Left Navigation Rail Matching Reference Image 1 & 2 */}
        <nav className="os-rail" aria-label="System Modules Navigation">
          <div style={{ padding: '1rem 0.85rem 0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1.5px solid #e8a23a',
                backgroundColor: 'rgba(232, 162, 58, 0.15)',
                color: '#e8a23a',
                fontFamily: "'Space Grotesk', serif",
                fontWeight: 800,
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(232, 162, 58, 0.35)',
                flexShrink: 0,
              }}
            >
              N
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
                NISHANT JAIN
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: '#e8a23a' }}>
                NJ-OS
              </div>
            </div>
          </div>

          <ul className="os-nav-list" role="tablist">
            <li className="os-nav-item">
              <button
                className="os-nav-btn"
                role="tab"
                aria-selected={activeModule === 'home'}
                aria-current={activeModule === 'home' ? 'true' : undefined}
                onClick={() => navigateTo('home')}
              >
                <span>🏠</span>
                <span className="os-nav-index">00</span>
                <span>HOME</span>
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
                  <span>{mod.icon}</span>
                  <span className="os-nav-index">{mod.num}</span>
                  <span>{mod.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="os-rail-footer">
            {/* World Map Location Widget Matching Reference Images */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                margin: '0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid #1e293b',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.6rem' }}>
                <span>LOCATION:</span>
                <span style={{ color: '#34d399' }}>● ONLINE</span>
              </div>
              <div style={{ color: '#00e5ff', fontWeight: 700, marginTop: '0.2rem' }}>
                INDORE, MP, INDIA
              </div>
            </div>

            <div className="os-shortcut-legend">
              <span className="os-key">1-9</span>
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

          {activeModule === 'map' && (
            <CaveMap
              onReturnToCave={onClose ? onClose : () => { window.location.href = '/nightfall/'; }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

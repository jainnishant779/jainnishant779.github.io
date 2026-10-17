import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StandalonePage } from './pages/StandalonePage';
import { NotFound } from './pages/NotFound';

// Lazy load the 3D experience so plain routes never download three.js
const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);

export function App() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: '#07080a',
            color: '#e8a23a',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          LOADING NJ-OS…
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/os" element={<StandalonePage module="home" />} />
        <Route path="/about" element={<StandalonePage module="identity" />} />
        <Route path="/projects" element={<StandalonePage module="projects" />} />
        <Route path="/projects/:slug" element={<StandalonePage module="project-detail" />} />
        <Route path="/experience" element={<StandalonePage module="experience" />} />
        <Route path="/skills" element={<StandalonePage module="skills" />} />
        <Route path="/achievements" element={<StandalonePage module="achievements" />} />
        <Route path="/contact" element={<StandalonePage module="contact" />} />
        <Route path="/cv" element={<StandalonePage module="dossier" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

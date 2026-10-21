import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StandalonePage } from './pages/StandalonePage';
import { NotFound } from './pages/NotFound';

// Lazy load the 3D experience so plain routes never download three.js
const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);

// Unlisted living style guide for the design system
const KitPage = React.lazy(() =>
  import('./pages/KitPage').then((m) => ({ default: m.KitPage }))
);

// Unlisted dev tool: click monitor corners on the final film frame -> public/film/screens.json
const CalibratePage = React.lazy(() =>
  import('./pages/CalibratePage').then((m) => ({ default: m.CalibratePage }))
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
        <Route path="/kit" element={<KitPage />} />
        <Route path="/calibrate" element={<CalibratePage />} />
        <Route path="/os" element={<StandalonePage module="home" />} />
        <Route path="/about" element={<StandalonePage module="identity" />} />
        <Route path="/projects" element={<StandalonePage module="projects" />} />
        <Route path="/projects/:slug" element={<StandalonePage module="project-detail" />} />
        <Route path="/experience" element={<StandalonePage module="experience" />} />
        <Route path="/skills" element={<StandalonePage module="skills" />} />
        <Route path="/achievements" element={<StandalonePage module="achievements" />} />
        <Route path="/contact" element={<StandalonePage module="contact" />} />
        <Route path="/cv" element={<StandalonePage module="dossier" />} />
        <Route path="/architecture" element={<StandalonePage module="architecture" />} />
        <Route path="/map" element={<StandalonePage module="map" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

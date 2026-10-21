import { useEffect, useRef, useState } from 'react';
import { Panel } from '@/components/kit/Panel';
import { Badge } from '@/components/kit/Badge';
import { MagneticButton } from '@/components/kit/MagneticButton';

type Pt = [number, number];

const SCREEN_NAMES = ['left', 'center', 'right'] as const;
const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;
const COLORS = ['var(--screen)', 'var(--accent)', 'var(--ok)'] as const;

/** Rough sanity check that a quad's corners are in TL, TR, BR, BL order. */
function quadLooksValid(q: Pt[]): boolean {
  if (q.length !== 4) return true;
  const [tl, tr, br, bl] = q;
  return tl[0] < tr[0] && bl[0] < br[0] && tl[1] < bl[1] && tr[1] < br[1];
}

/**
 * Dev tool (unlisted route /calibrate): click the four corners of each monitor on the FINAL film frame.
 * The result is saved as public/film/screens.json and the live OS panels then line up with the monitors.
 */
export function CalibratePage() {
  const base = import.meta.env.BASE_URL;
  const stageRef = useRef<HTMLDivElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number; count: number } | null>(null);
  const [points, setPoints] = useState<Pt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${base}film/manifest.json`)
      .then((r) => r.json())
      .then((m) => setDims({ w: m.desktop.width, h: m.desktop.height, count: m.count }))
      .catch((e) => setError(`Could not load film/manifest.json: ${String(e)}`));

    // Start from the existing calibration when there is one
    fetch(`${base}film/screens.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s?.left && s?.center && s?.right) setPoints([...s.left, ...s.center, ...s.right]);
      })
      .catch(() => undefined);
  }, [base]);

  const toNative = (e: React.PointerEvent): Pt | null => {
    const el = stageRef.current;
    if (!el || !dims) return null;
    const r = el.getBoundingClientRect();
    const x = Math.min(dims.w, Math.max(0, ((e.clientX - r.left) / r.width) * dims.w));
    const y = Math.min(dims.h, Math.max(0, ((e.clientY - r.top) / r.height) * dims.h));
    return [Math.round(x), Math.round(y)];
  };

  const onStagePointerDown = (e: React.PointerEvent) => {
    if (dragIndex.current !== null || points.length >= 12) return;
    const p = toNative(e);
    if (p) setPoints((prev) => [...prev, p]);
  };

  const onStagePointerMove = (e: React.PointerEvent) => {
    const i = dragIndex.current;
    if (i === null) return;
    const p = toNative(e);
    if (p) setPoints((prev) => prev.map((q, idx) => (idx === i ? p : q)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') setPoints((prev) => prev.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const complete = points.length === 12;
  const quads = SCREEN_NAMES.map((_, s) => points.slice(s * 4, s * 4 + 4));
  const json = complete
    ? JSON.stringify({ left: quads[0], center: quads[1], right: quads[2] }, null, 2)
    : '';
  const next = points.length < 12 ? { screen: SCREEN_NAMES[Math.floor(points.length / 4)], corner: CORNERS[points.length % 4] } : null;
  const misordered = quads.some((q) => !quadLooksValid(q));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screens.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const lastFrame = dims ? `${base}film/desktop/f_${String(dims.count - 1).padStart(4, '0')}.webp` : '';

  return (
    <div className="min-h-screen bg-bg-0 px-4 py-8 text-text-1 md:px-8">
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent">DEV TOOL // UNLISTED</span>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">Monitor calibration</h1>
          <p className="max-w-[70ch] text-text-2">
            Click the four corners of each monitor on the final film frame, in this order for each monitor: top-left,
            top-right, bottom-right, bottom-left. Do the left monitor, then the centre, then the right. Drag a point to
            adjust it, press Backspace to undo.
          </p>
        </header>

        {error && <Panel className="border-danger/40 text-danger">{error}</Panel>}

        <Panel glass className="flex flex-wrap items-center gap-3" data-testid="cal-status">
          {next ? (
            <>
              <Badge tone="accent">
                {points.length + 1} / 12
              </Badge>
              <span data-testid="cal-prompt" className="font-mono text-[0.8125rem] uppercase tracking-[0.08em]">
                Click the {next.screen} monitor — {next.corner} corner
              </span>
            </>
          ) : (
            <>
              <Badge tone="ok">12 / 12</Badge>
              <span className="font-mono text-[0.8125rem] uppercase tracking-[0.08em]">
                All corners placed. Save the JSON below as public/film/screens.json
              </span>
            </>
          )}
          {misordered && <Badge tone="warn">Corners look out of order</Badge>}
          <div className="ml-auto flex gap-2">
            <MagneticButton onClick={() => setPoints((p) => p.slice(0, -1))} strength={0}>
              Undo
            </MagneticButton>
            <MagneticButton onClick={() => setPoints([])} strength={0} data-testid="cal-reset">
              Reset
            </MagneticButton>
          </div>
        </Panel>

        <div
          ref={stageRef}
          data-testid="cal-stage"
          className="relative aspect-[16/9] w-full max-w-[1440px] cursor-crosshair select-none overflow-hidden rounded-card border border-line bg-bg-1 touch-none"
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={() => (dragIndex.current = null)}
          onPointerLeave={() => (dragIndex.current = null)}
        >
          {lastFrame && <img src={lastFrame} alt="Final film frame" draggable={false} className="block h-full w-full" />}
          {dims && (
            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${dims.w} ${dims.h}`} preserveAspectRatio="none">
              {quads.map((q, s) =>
                q.length === 4 ? (
                  <polygon
                    key={s}
                    points={q.map((p) => p.join(',')).join(' ')}
                    style={{ fill: COLORS[s], stroke: COLORS[s] }}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ) : null,
              )}
              {points.map((p, i) => (
                <circle
                  key={i}
                  data-testid={`cal-point-${i}`}
                  cx={p[0]}
                  cy={p[1]}
                  r={7}
                  style={{ fill: COLORS[Math.floor(i / 4)], stroke: 'var(--bg-0)', cursor: 'grab' }}
                  strokeWidth={2}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragIndex.current = i;
                    (e.target as Element).setPointerCapture?.(e.pointerId);
                  }}
                />
              ))}
            </svg>
          )}
        </div>

        {complete && (
          <Panel className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <MagneticButton variant="primary" onClick={download}>
                Download screens.json
              </MagneticButton>
              <MagneticButton onClick={copy} data-testid="cal-copy">
                {copied ? 'Copied' : 'Copy JSON'}
              </MagneticButton>
            </div>
            <p className="text-sm text-text-2">
              Save it as <code className="font-mono text-text-1">nightfall-src/public/film/screens.json</code>, then rebuild
              (or just refresh the dev server). The OS panels on the monitors will line up with these corners.
            </p>
            <pre data-testid="cal-json" className="overflow-x-auto rounded-ctl border border-line bg-bg-0 p-3 font-mono text-[0.75rem] text-text-2">
              {json}
            </pre>
          </Panel>
        )}
      </main>
    </div>
  );
}

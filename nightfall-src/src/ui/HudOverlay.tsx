import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../state/store';
import { getCVUrl } from '../lib/assets';
import { sound } from '../lib/sound';
import { cn } from '@/lib/utils';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { SkipButton } from './SkipButton';

interface HudOverlayProps {
  onOpenOS: () => void;
  onSkipIntro: () => void;
  onAccessFacility: () => void;
}

function getFilmHint(progress: number, gateEnd: number): string {
  if (progress < 0.05) return 'FACILITY VAULT ENTRANCE // SECURITY BLAST DOOR LOCKED';
  if (progress < gateEnd) return 'HYDRAULIC GATES UNLATCHING // BREACHING INTERIOR CAVERN';
  if (progress < 0.50) return 'TRANSIT CORRIDOR // ADVANCING DOWN CATWALK';
  if (progress < 0.78) return 'SUBTERRANEAN CAVERN // CATWALK PASSAGE & WATERFALL';
  if (progress < 0.90) return 'APPROACHING COMMAND WORKSTATION PLATFORM';
  return 'TRIPLE-MONITOR WORKSTATION // NJ-OS [E]';
}

// Solid (not blurred) chips: a backdrop blur over the scrubbing film canvas costs frames.
const chip =
  'pointer-events-auto inline-flex min-h-9 items-center gap-1.5 rounded-ctl border px-3 font-mono text-[0.76rem] font-semibold no-underline transition-colors duration-[220ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const HudOverlay: React.FC<HudOverlayProps> = ({ onOpenOS, onSkipIntro, onAccessFacility }) => {
  const progress = useStore((state) => state.progress);
  const audioEnabled = useStore((state) => state.audioEnabled);
  const setAudioEnabled = useStore((state) => state.setAudioEnabled);
  const gateEnd = useStore((state) => state.gateEnd);
  const cvUrl = getCVUrl();

  const showAccessButton = progress < 0.06;
  const activeHint = getFilmHint(progress, gateEnd);
  const percent = Math.round(progress * 100);

  const handleToggleAudio = () => {
    sound.initContext();
    sound.playUiClick();
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="hud-overlay pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 select-none sm:p-5">
      {/* Legibility scrims: the film is bright at the top (lamps) and the bottom (wet floor) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-chip border-[1.5px] border-accent bg-accent-soft font-display text-[1.1rem] font-extrabold text-accent shadow-[0_0_10px_rgba(232,162,58,0.35)]">
            N
          </div>
          <div className="flex flex-col gap-0.5 font-mono">
            <div className="text-[0.85rem] font-bold tracking-[0.05em] text-text-1">THE ENGINEER&apos;S CAVE</div>
            <div className="text-[0.7rem] text-accent">NISHANT JAIN // AI/ML · EDGE AI · COMPUTER VISION</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={cn(
              chip,
              'audio-toggle-btn cursor-pointer',
              audioEnabled ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong bg-bg-0/85 text-text-2 hover:text-text-1',
            )}
            title={audioEnabled ? 'Mute audio' : 'Enable facility audio effects'}
          >
            {audioEnabled ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
            {audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioEnabled) sound.playBootHum();
              onOpenOS();
            }}
            className={cn(chip, 'quick-portfolio-btn cursor-pointer border-accent bg-bg-0/90 text-accent hover:bg-accent hover:text-bg-0')}
            title="Open Quick Portfolio / NJ-OS Command Center"
          >
            QUICK PORTFOLIO [OS] →
          </button>

          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className={cn(chip, 'border-line-strong bg-bg-0/85 text-text-1 hover:border-accent/50')}>
            CV ↗
          </a>

          <Link
            to="/story"
            className={cn(chip, 'border-accent/50 bg-bg-0/85 text-accent hover:border-accent hover:text-text-1')}
            title="Read the VOX-style editorial story edition"
          >
            STORY ↗
          </Link>

          <Link to="/contact" className={cn(chip, 'border-line-strong bg-bg-0/85 text-text-2 hover:border-accent/50 hover:text-text-1')}>
            CONTACT
          </Link>
        </div>
      </div>

      {/* Gate prompt */}
      <div className={cn('relative flex items-center justify-center', showAccessButton ? 'pointer-events-auto' : 'pointer-events-none')}>
        {showAccessButton && (
          <div className="flex flex-col items-center gap-2.5">
            <div className="rounded-chip border border-accent/45 bg-bg-0/90 px-3 py-1 font-mono text-[0.72rem] tracking-[0.12em] text-accent shadow-[0_0_15px_rgba(232,162,58,0.25)]">
              {'// SUBTERRANEAN HEADQUARTERS BLAST DOOR'}
            </div>
            <ShimmerButton
              type="button"
              onClick={onAccessFacility}
              borderRadius="6px"
              background="rgba(5, 6, 7, 0.94)"
              shimmerDuration="2.8s"
              className="access-facility-btn min-h-12 cursor-pointer border-2 border-accent px-8 py-3 font-mono text-[0.94rem] font-bold tracking-[0.08em] text-accent shadow-[0_0_30px_rgba(232,162,58,0.45)]"
            >
              ACCESS THE FACILITY ▾
            </ShimmerButton>
            <div className="font-mono text-[0.68rem] tracking-[0.06em] text-text-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              CLICK TO UNLOCK OR SCROLL DOWN
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar: what the camera is doing + depth */}
      <div className="pointer-events-auto relative flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 font-mono text-[0.72rem] text-text-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
          <span className="min-w-0 truncate">{activeHint}</span>
          <span className="shrink-0 text-accent">{`${percent}% FACILITY DEPTH`}</span>
        </div>
        <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-0 origin-left bg-accent transition-transform duration-100 ease-linear"
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </div>
      </div>

      {progress < 0.85 && <SkipButton onSkip={onSkipIntro} />}
    </div>
  );
};

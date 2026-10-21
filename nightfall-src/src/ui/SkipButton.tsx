import React from 'react';
import { SkipForward } from 'lucide-react';

interface SkipButtonProps {
  onSkip: () => void;
}

export const SkipButton: React.FC<SkipButtonProps> = ({ onSkip }) => (
  <button
    type="button"
    onClick={onSkip}
    className="skip-intro-btn pointer-events-auto fixed right-5 bottom-14 z-50 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-ctl border border-accent/40 bg-bg-0/85 px-3 font-mono text-[0.75rem] text-accent transition-colors duration-[220ms] hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
  >
    SKIP INTRO
    <SkipForward className="size-3.5" aria-hidden />
  </button>
);

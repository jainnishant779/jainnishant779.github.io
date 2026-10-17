import React from 'react';

interface SkipButtonProps {
  onSkip: () => void;
}

export const SkipButton: React.FC<SkipButtonProps> = ({ onSkip }) => {
  return (
    <button
      onClick={onSkip}
      className="skip-intro-btn"
      style={{
        position: 'fixed',
        bottom: '3.6rem',
        right: '1.5rem',
        zIndex: 50,
        background: 'rgba(14, 17, 20, 0.85)',
        border: '1px solid rgba(232, 162, 58, 0.4)',
        color: '#e8a23a',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        padding: '0.45rem 0.85rem',
        borderRadius: '3px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease',
      }}
    >
      SKIP INTRO ⏭
    </button>
  );
};

import React from 'react';

export interface HandIllustrationProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Detailed pen-and-ink SVG illustration of an expressive hand with fingers pinching upward.
 * Crafted with hand-drawn contours, anatomical knuckles, and fine cross-hatching.
 * Provides fingertip coordinate reference points in a 320x360 viewBox.
 */
export const HandIllustration: React.FC<HandIllustrationProps> = ({ className = '', style }) => {
  return (
    <svg
      viewBox="0 0 320 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Soft paper ink shadow */}
        <filter id="inkBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#0d0d0d" floodOpacity="0.12" />
        </filter>
      </defs>

      <g filter="url(#inkBlur)" stroke="#0d0d0d" strokeLinecap="round" strokeLinejoin="round">
        {/* Wrist & Forearm Contours */}
        <path d="M 110 350 C 112 310, 118 270, 126 235 C 130 215, 134 195, 138 180" strokeWidth="3.2" />
        <path d="M 215 350 C 210 315, 204 275, 196 235 C 192 215, 188 190, 182 170" strokeWidth="3.2" />

        {/* Forearm Hatching */}
        <path d="M 124 330 L 140 338 M 122 315 L 142 324 M 126 300 L 148 310 M 128 285 L 152 296" strokeWidth="1.2" strokeOpacity="0.5" />
        <path d="M 198 335 L 180 342 M 194 320 L 178 328 M 190 305 L 174 314 M 186 290 L 170 300" strokeWidth="1.2" strokeOpacity="0.5" />

        {/* Palm Body & Thenar Eminence */}
        <path d="M 138 180 C 130 160, 115 145, 110 125 C 106 108, 112 92, 122 82 C 132 72, 148 76, 156 94 C 162 108, 168 132, 172 150" strokeWidth="2.8" />
        <path d="M 182 170 C 195 155, 212 140, 218 120 C 224 100, 218 84, 206 74 C 196 66, 180 72, 174 90 C 170 106, 166 128, 164 145" strokeWidth="2.8" />

        {/* Palm Cross-Hatching Creases */}
        <path d="M 135 155 C 145 160, 160 165, 175 160" strokeWidth="1.8" strokeOpacity="0.65" />
        <path d="M 140 172 C 150 176, 162 178, 172 174" strokeWidth="1.6" strokeOpacity="0.55" />
        <path d="M 142 135 L 150 148 M 148 132 L 156 144 M 154 130 L 162 142" strokeWidth="1.2" strokeOpacity="0.45" />

        {/* Thumb (Left Pinch) */}
        <path d="M 110 125 C 98 108, 86 85, 92 68 C 96 56, 108 52, 118 60 C 128 68, 134 82, 138 98" strokeWidth="2.6" />
        <path d="M 104 62 C 107 58, 112 58, 115 62" strokeWidth="1.4" strokeOpacity="0.6" />

        {/* Index Finger (Primary Center Pull Pinch) */}
        <path d="M 122 82 C 120 58, 126 34, 134 22 C 140 14, 150 14, 154 22 C 158 32, 156 52, 156 75" strokeWidth="2.6" />
        {/* Index knuckle lines */}
        <path d="M 130 45 C 136 48, 146 48, 152 45" strokeWidth="1.4" strokeOpacity="0.6" />
        <path d="M 136 28 C 140 30, 146 30, 150 28" strokeWidth="1.4" strokeOpacity="0.6" />

        {/* Middle Finger */}
        <path d="M 156 75 C 160 52, 168 28, 176 16 C 182 8, 192 10, 194 20 C 196 32, 192 54, 188 78" strokeWidth="2.6" />
        <path d="M 170 42 C 176 44, 184 44, 190 42" strokeWidth="1.4" strokeOpacity="0.6" />

        {/* Ring Finger */}
        <path d="M 188 78 C 194 60, 202 42, 210 32 C 216 26, 224 28, 226 36 C 228 48, 222 66, 214 90" strokeWidth="2.4" />
        <path d="M 204 54 C 210 56, 218 56, 222 54" strokeWidth="1.4" strokeOpacity="0.6" />

        {/* Pinky Finger */}
        <path d="M 214 90 C 222 76, 232 62, 240 54 C 246 50, 252 52, 252 60 C 252 72, 242 90, 230 112" strokeWidth="2.2" />

        {/* Delicate anatomical shading cross-hatching */}
        <g strokeWidth="0.9" strokeOpacity="0.38">
          <line x1="130" y1="90" x2="138" y2="102" />
          <line x1="134" y1="86" x2="142" y2="98" />
          <line x1="138" y1="82" x2="146" y2="94" />
          <line x1="162" y1="85" x2="170" y2="98" />
          <line x1="166" y1="82" x2="174" y2="94" />
          <line x1="170" y1="80" x2="178" y2="92" />
          <line x1="192" y1="95" x2="200" y2="108" />
          <line x1="196" y1="92" x2="204" y2="104" />
        </g>
      </g>
    </svg>
  );
};

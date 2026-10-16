import React from 'react';

interface PristineLogoProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
}

export const PristineLogo: React.FC<PristineLogoProps> = ({
  className = '',
  style = {},
  width = '100%',
  height = 'auto',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      fill="none"
      className={className}
      style={{ width, height, ...style }}
    >
      <defs>
        <linearGradient id="pristineGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#89CFF0" />
          <stop offset="50%" stopColor="#48A9E6" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>
        <linearGradient id="sparkleGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EBF5FB" />
          <stop offset="100%" stopColor="#89CFF0" />
        </linearGradient>
        <filter id="glowLogo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Isotipo Icon: Pure Diamond & Sparkle */}
      <g transform="translate(15, 10)">
        {/* Base Crystal Shape */}
        <path d="M40 5 L70 30 L60 70 L20 70 L10 30 Z" fill="url(#pristineGradLogo)" />
        {/* Crystal Facets */}
        <path
          d="M40 5 L40 70 M40 5 L20 70 M40 5 L60 70"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <path
          d="M10 30 L70 30"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        {/* Bright Sparkle */}
        <path
          d="M62 12 Q65 20 73 23 Q65 26 62 34 Q59 26 51 23 Q59 20 62 12 Z"
          fill="url(#sparkleGradLogo)"
          filter="url(#glowLogo)"
        />
      </g>

      {/* Typography: PRISTINE */}
      <text
        x="110"
        y="58"
        fontFamily="'Inter', -apple-system, sans-serif"
        fontSize="36"
        fontWeight="800"
        letterSpacing="4"
        fill="#1E3A5F"
      >
        PRISTINE
      </text>
      {/* Subtitle */}
      <text
        x="112"
        y="76"
        fontFamily="'Inter', -apple-system, sans-serif"
        fontSize="11"
        fontWeight="600"
        letterSpacing="3"
        fill="#48A9E6"
      >
        MANAGEMENT PLATFORM
      </text>
    </svg>
  );
};

export default PristineLogo;

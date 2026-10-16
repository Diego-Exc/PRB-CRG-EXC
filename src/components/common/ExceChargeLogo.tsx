import React from 'react';

interface ExceChargeLogoProps {
  className?: string;
  iconOnly?: boolean;
  withTagline?: boolean;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const ExceChargeLogo: React.FC<ExceChargeLogoProps> = ({
  className = '',
  iconOnly = false,
  withTagline = false,
  theme = 'light',
  size = 'md',
}) => {
  // Dimension presets
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* ExceCharge Geometric Icon with Lightning Cutout */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="exceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="50%" stopColor="#00A86B" />
            <stop offset="100%" stopColor="#004D40" />
          </linearGradient>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00A86B" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer stylized C ring */}
        <path
          d="M 72 20 
             C 58 14, 40 16, 26 27 
             C 12 38, 8 58, 15 73 
             C 23 88, 43 96, 60 92 
             C 74 88, 84 78, 88 66 
             L 70 66 
             C 66 73, 58 78, 49 78 
             C 36 78, 27 68, 26 55 
             C 25 42, 33 32, 45 30 
             C 55 28, 65 32, 71 38 
             Z"
          fill="url(#exceGradient)"
          filter="url(#softGlow)"
        />

        {/* Dynamic Electric Lightning Bolt embedded inside C */}
        <polygon
          points="54,16 34,52 48,52 42,84 66,46 51,46"
          fill="url(#exceGradient)"
          stroke={theme === 'dark' ? '#0A1118' : '#ffffff'}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark and Optional Tagline */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-black tracking-tight ${
                size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
              } ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              Exce
            </span>
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent ${
                size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
              }`}
            >
              Charge
            </span>
          </div>
          {withTagline && (
            <span
              className={`font-medium tracking-normal mt-0.5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              } ${size === 'sm' ? 'text-[9px]' : 'text-[11px]'}`}
            >
              Tu energía, más cerca
            </span>
          )}
        </div>
      )}
    </div>
  );
};

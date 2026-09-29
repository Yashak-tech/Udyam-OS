import React from 'react';

export default function UdyamLogo({
  size = 'md',
  showWordmark = false,
  compact = false,
  className = ''
}) {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 32;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Geometric 'U' + Upward Ascent Brand Symbol */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="udyamGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="0.6" stopColor="#059669" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="udyamGlow" x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* Outer Hex-Rounded Boundary */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="#0F172A"
          stroke="url(#udyamGrad)"
          strokeWidth="2"
        />

        {/* Inner Geometric 'U' Path with Upward Arrow Wedge */}
        <path
          d="M14 14V27C14 32.5228 18.4772 37 24 37C29.5228 37 34 32.5228 34 27V14M24 30V13M20 17L24 13L28 17"
          stroke="url(#udyamGlow)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional Brand Wordmark */}
      {showWordmark && (
        <div className="flex items-center gap-1.5 leading-none select-none">
          <span className={`font-extrabold tracking-wider text-white ${
            pixelSize >= 40 ? 'text-2xl' : pixelSize >= 30 ? 'text-lg' : 'text-sm'
          }`}>
            UDYAM
          </span>
          <span className={`font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5 ${
            pixelSize >= 40 ? 'text-sm' : pixelSize >= 30 ? 'text-xs' : 'text-[10px]'
          }`}>
            OS
          </span>
        </div>
      )}
    </div>
  );
}

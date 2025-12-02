export function IslamicPattern({ className = "", opacity = 0.1 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={`absolute pointer-events-none ${className}`}
      style={{ opacity }}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="islamicPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M20 0 L25 5 L20 10 L15 5 Z M0 20 L5 25 L0 30 L-5 25 Z M40 20 L45 25 L40 30 L35 25 Z M20 40 L25 45 L20 50 L15 45 Z"
            fill="currentColor"
            opacity="0.5"
          />
          <circle cx="20" cy="20" r="2" fill="currentColor" />
          <circle cx="0" cy="0" r="1.5" fill="currentColor" />
          <circle cx="40" cy="0" r="1.5" fill="currentColor" />
          <circle cx="0" cy="40" r="1.5" fill="currentColor" />
          <circle cx="40" cy="40" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#islamicPattern)" />
    </svg>
  );
}

export function MosqueLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Crescent */}
      <path
        d="M32 8 C28 8 25 11 25 15 C25 19 28 22 32 22 C30 22 28 20 28 17 C28 14 30 12 32 12 Z"
        fill="currentColor"
      />
      {/* Dome */}
      <ellipse cx="32" cy="28" rx="14" ry="8" fill="currentColor" opacity="0.8" />
      {/* Main building */}
      <rect x="22" y="28" width="20" height="20" fill="currentColor" />
      {/* Door */}
      <path d="M28 38 L28 48 L36 48 L36 38 C36 35 34 33 32 33 C30 33 28 35 28 38 Z" fill="white" opacity="0.3" />
      {/* Minarets */}
      <rect x="18" y="32" width="3" height="16" fill="currentColor" opacity="0.9" />
      <rect x="43" y="32" width="3" height="16" fill="currentColor" opacity="0.9" />
      {/* Minaret tops */}
      <circle cx="19.5" cy="30" r="2.5" fill="currentColor" />
      <circle cx="44.5" cy="30" r="2.5" fill="currentColor" />
      {/* Base */}
      <rect x="18" y="48" width="28" height="3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-xl bg-[oklch(0.18_0.04_160)] border border-primary/30"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} fill="none" aria-label="BETANO logo mark">
        <defs>
          <linearGradient id="betano-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="oklch(0.92 0.22 145)" />
            <stop offset="1" stopColor="oklch(0.68 0.24 150)" />
          </linearGradient>
        </defs>
        <path
          d="M6 4 h11 a6 6 0 0 1 4.2 10.2 A6.4 6.4 0 0 1 17.4 26 H6 Z M11 9 v4 h6 a2 2 0 0 0 0-4 Z M11 17 v4 h6.4 a2 2 0 0 0 0-4 Z"
          fill="url(#betano-grad)"
        />
      </svg>
    </div>
  );
}

export function Brand({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="text-2xl font-bold text-primary text-glow tracking-[0.18em]">BETANO</span>
    </div>
  );
}
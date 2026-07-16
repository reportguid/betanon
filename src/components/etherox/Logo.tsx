export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-xl bg-[oklch(0.18_0.04_160)] border border-primary/30"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none">
        <g stroke="oklch(0.82 0.24 145)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 3 L14 9 L20 9 L15 13 L17 19 L12 16 L7 19 L9 13 L4 9 L10 9 Z" fill="oklch(0.82 0.24 145 / 0.25)" />
        </g>
      </svg>
    </div>
  );
}

export function Brand({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="text-2xl font-bold text-primary text-glow tracking-tight">BETANO</span>
    </div>
  );
}
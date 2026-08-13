type Variant = "dark" | "light" | "mono";

function palette(variant: Variant) {
  if (variant === "mono") return { a: "currentColor", b: "currentColor", text: "currentColor" };
  if (variant === "light")
    return { a: "oklch(0.52 0.26 292)", b: "oklch(0.62 0.14 205)", text: "oklch(0.22 0.02 275)" };
  return { a: "oklch(0.68 0.25 292)", b: "oklch(0.84 0.13 205)", text: "oklch(0.97 0.005 285)" };
}

/**
 * ETHERUM symbol — a geometric "E" built from three angular crystal facets
 * with an upward point suggesting growth. Pure SVG, sharp at any size.
 */
export function EtherumSymbol({
  size = 40,
  variant = "dark",
  className,
  title = "ETHERUM",
}: {
  size?: number;
  variant?: Variant;
  className?: string;
  title?: string;
}) {
  const { a, b } = palette(variant);
  const id = `eth-${variant}`;
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="6" y1="2" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      {/* upward crystal point — progress */}
      <path d="M24 2 L34 12 H14 Z" fill={`url(#${id}-g)`} opacity=".95" />
      {/* top bar facet */}
      <path d="M12 15 H38 L33 23 H12 Z" fill={`url(#${id}-g)`} />
      {/* middle bar facet (shorter) */}
      <path d="M12 26 H30 L26 33 H12 Z" fill={`url(#${id}-g)`} opacity=".8" />
      {/* bottom bar facet */}
      <path d="M12 36 H36 L31 44 H12 Z" fill={`url(#${id}-g)`} opacity=".92" />
      {/* spine */}
      <path d="M6 12 L12 15 V44 L6 40 Z" fill={`url(#${id}-g)`} opacity=".55" />
    </svg>
  );
}

/** Full horizontal lockup: symbol + ETHERUM wordmark. */
export function EtherumLogo({
  size = 36,
  variant = "dark",
  showWord = true,
  className,
}: {
  size?: number;
  variant?: Variant;
  showWord?: boolean;
  className?: string;
}) {
  const { text } = palette(variant);
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`} aria-label="ETHERUM">
      <EtherumSymbol size={size} variant={variant} />
      {showWord && (
        <span
          className="font-display font-extrabold tracking-[0.22em]"
          style={{ fontSize: size * 0.55, color: text }}
        >
          ETHERUM
        </span>
      )}
    </div>
  );
}

/** Square app-icon tile with the symbol centred. */
export function EtherumAppIcon({ size = 48, radius = 12 }: { size?: number; radius?: number }) {
  return (
    <div
      className="grid place-items-center border border-primary/25"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(145deg, oklch(0.17 0.03 275), oklch(0.12 0.02 275))",
      }}
      aria-label="ETHERUM"
    >
      <EtherumSymbol size={size * 0.62} />
    </div>
  );
}
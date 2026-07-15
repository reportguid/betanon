import { useEffect, useMemo, useState } from "react";

const SYMBOLS = ["₦", "$", "€", "£", "¥", "%", "₿", "Ξ"];

type Money = { ch: string; left: number; size: number; delay: number; duration: number; drift: number; opacity: number };
type Dot = { left: number; bottom: number; size: number; dx: number; dy: number; delay: number; duration: number; opacity: number };
type Bokeh = { left: number; top: number; size: number; delay: number; duration: number };
type Node = { x: number; y: number };
type Shape = { kind: "sq" | "ring" | "tri"; left: number; size: number; dx: number; dy: number; delay: number; duration: number; opacity: number };

export function CurrencyBackdrop({ moneyCount = 14, particleCount = 28, bokehCount = 6, nodeCount = 12, shapeCount = 8 }: { moneyCount?: number; particleCount?: number; bokehCount?: number; nodeCount?: number; shapeCount?: number }) {
  // Auto-reduce density on small/low-power devices for battery + FPS.
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSmall = window.matchMedia("(max-width: 640px)").matches;
    const lowCores = (navigator as unknown as { hardwareConcurrency?: number }).hardwareConcurrency && (navigator as unknown as { hardwareConcurrency: number }).hardwareConcurrency <= 4;
    setScale(isSmall || lowCores ? 0.55 : 1);
  }, []);
  const s = (n: number) => Math.max(3, Math.round(n * scale));
  const money = useMemo<Money[]>(() => Array.from({ length: s(moneyCount) }).map((_, i) => ({
    ch: SYMBOLS[i % SYMBOLS.length],
    left: Math.random() * 100,
    size: 14 + Math.random() * 26,
    delay: -Math.random() * 22,
    duration: 22 + Math.random() * 24,
    drift: (Math.random() - 0.5) * 80,
    opacity: 0.05 + Math.random() * 0.1,
  })), [moneyCount, scale]);

  const dots = useMemo<Dot[]>(() => Array.from({ length: s(particleCount) }).map(() => ({
    left: Math.random() * 100,
    bottom: -5 - Math.random() * 20,
    size: 2 + Math.random() * 4,
    dx: (Math.random() - 0.5) * 120,
    dy: -(80 + Math.random() * 60),
    delay: -Math.random() * 30,
    duration: 28 + Math.random() * 32,
    opacity: 0.5 + Math.random() * 0.5,
  })), [particleCount, scale]);

  const bokeh = useMemo<Bokeh[]>(() => Array.from({ length: s(bokehCount) }).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 120 + Math.random() * 220,
    delay: -Math.random() * 12,
    duration: 14 + Math.random() * 16,
  })), [bokehCount, scale]);

  const nodes = useMemo<Node[]>(() => Array.from({ length: s(nodeCount) }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  })), [nodeCount, scale]);

  const kinds: Shape["kind"][] = ["sq", "ring", "tri"];
  const shapes = useMemo<Shape[]>(() => Array.from({ length: s(shapeCount) }).map((_, i) => ({
    kind: kinds[i % kinds.length],
    left: Math.random() * 100,
    size: 10 + Math.random() * 18,
    dx: (Math.random() - 0.5) * 140,
    dy: -(60 + Math.random() * 70),
    delay: -Math.random() * 40,
    duration: 34 + Math.random() * 30,
    opacity: 0.25 + Math.random() * 0.25,
  })), [shapeCount, scale]);

  // Build a sparse set of connections (each node linked to its nearest 1–2 neighbors).
  const edges = useMemo(() => {
    const es: { a: Node; b: Node; d: number }[] = [];
    nodes.forEach((n, i) => {
      const dists = nodes.map((m, j) => ({ j, d: Math.hypot(n.x - m.x, n.y - m.y) })).filter(x => x.j !== i).sort((a, b) => a.d - b.d).slice(0, 2);
      dists.forEach(({ j, d }) => es.push({ a: n, b: nodes[j], d }));
    });
    return es;
  }, [nodes]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* base dark → green gradient */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% -10%, oklch(0.28 0.16 150 / .5), transparent 55%), radial-gradient(ellipse at 50% 110%, oklch(0.22 0.12 155 / .55), transparent 55%), linear-gradient(180deg, oklch(0.08 0.02 160) 0%, oklch(0.12 0.04 160) 100%)" }} />

      {/* soft bokeh circles */}
      {bokeh.map((b, i) => (
        <span key={`b-${i}`} className="ex-bokeh" style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.duration}s` }} />
      ))}

      {/* animated graph + wave lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ex-line-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.82 0.24 145)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.88 0.26 145)" stopOpacity=".7" />
            <stop offset="100%" stopColor="oklch(0.82 0.24 145)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* trading graph line */}
        <path className="ex-graph-line" d="M0,420 C120,380 180,470 260,410 S420,300 520,340 680,260 800,220" fill="none" stroke="url(#ex-line-grad)" strokeWidth="1.4" opacity=".55" />
        <path className="ex-graph-line" style={{ animationDuration: "34s" }} d="M0,180 C140,220 220,140 320,180 S500,260 620,200 780,140 800,160" fill="none" stroke="url(#ex-line-grad)" strokeWidth="1" opacity=".35" />
        {/* slow drifting wave */}
        <g className="ex-wave">
          <path d="M0,520 C100,500 200,540 300,520 S500,500 600,520 800,540 900,520 1100,500 1200,520 1400,540 1500,520 1600,520 1600,520 L1600,600 L0,600 Z" fill="oklch(0.4 0.2 150 / .05)" />
        </g>
        {/* network edges */}
        {edges.map((e, i) => (
          <line key={`e-${i}`} className="ex-net" x1={`${e.a.x}%`} y1={`${e.a.y}%`} x2={`${e.b.x}%`} y2={`${e.b.y}%`} stroke="oklch(0.82 0.24 145)" strokeWidth="0.6" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        {nodes.map((n, i) => (
          <circle key={`n-${i}`} cx={`${n.x}%`} cy={`${n.y}%`} r="1.5" fill="oklch(0.9 0.26 145)" opacity=".5" />
        ))}
      </svg>

      {/* glowing particles */}
      {dots.map((d, i) => (
        <span key={`d-${i}`} className="ex-particle" style={{
          left: `${d.left}%`, bottom: `${d.bottom}%`, width: d.size, height: d.size,
          animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s`,
          // @ts-expect-error css var
          "--dx": `${d.dx}px`, "--dy": `${d.dy}vh`, "--o": d.opacity,
        }} />
      ))}

      {/* floating currency symbols */}
      {money.map((p, i) => (
        <span key={`m-${i}`} className="ex-money font-display font-bold text-primary/30 absolute select-none"
          style={{ left: `${p.left}%`, bottom: "-10%", fontSize: `${p.size}px`, opacity: p.opacity, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
          // @ts-expect-error css var
          "--drift": `${p.drift}px` }}>
          {p.ch}
        </span>
      ))}

      {/* rotating geometric shapes */}
      {shapes.map((sh, i) => (
        <span key={`s-${i}`} className={`ex-shape ex-shape-${sh.kind}`} style={{
          left: `${sh.left}%`, bottom: "-8%",
          width: sh.size, height: sh.size,
          animationDelay: `${sh.delay}s`, animationDuration: `${sh.duration}s`,
          // @ts-expect-error css var
          "--dx": `${sh.dx}px`, "--dy": `${sh.dy}vh`, "--o": sh.opacity, "--tri": `${sh.size / 2}px`,
        }} />
      ))}
    </div>
  );
}
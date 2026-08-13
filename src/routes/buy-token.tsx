import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft, Check, AlertTriangle, KeyRound } from "lucide-react";

export const Route = createFileRoute("/buy-token")({
  head: () => ({ meta: [{ title: "Buy ETHERUM Token" }] }),
  component: BuyToken,
});

const PERKS = [
  "Required to verify every withdrawal",
  "One-time purchase — never expires",
  "Instant activation after admin approval",
  "Tied to your ETHERUM account only",
];

function BuyToken() {
  const nav = useNavigate();
  return (
    <MobileFrame>
      <header className="flex items-center gap-4 ex-fade-up">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border transition hover:scale-105">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Buy ETHERUM Token</h1>
          <p className="text-sm text-muted-foreground">One-time withdrawal verification key</p>
        </div>
      </header>

      <section className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-5 glow-soft ex-fade-up ex-delay-1">
        <div className="text-xs tracking-widest text-muted-foreground">WHAT YOU GET</div>
        <ul className="mt-4 space-y-3">
          {PERKS.map((p, i) => (
            <li key={p} className={`flex items-start gap-3 ex-fade-up ex-delay-${i + 2}`}>
              <span className="grid place-items-center size-6 rounded-md bg-primary/15 border border-primary/40 text-primary mt-0.5">
                <Check size={14} strokeWidth={3} />
              </span>
              <span className="text-[15px]">{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-3xl border border-primary/25 bg-card/60 p-5 glow-soft ex-fade-up ex-delay-3">
        <div className="text-xs tracking-widest text-muted-foreground">ORDER SUMMARY</div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold">ETHERUM Token</div>
            <p className="text-sm text-muted-foreground mt-1">One-time withdrawal verification — pay once, use it to verify every withdrawal forever.</p>
          </div>
          <div className="text-lg font-bold whitespace-nowrap">₦8,300</div>
        </div>
        <div className="my-4 border-t border-border" />
        <div className="flex items-center justify-between">
          <div className="font-bold">Total</div>
          <div className="text-2xl font-bold text-primary text-glow">₦8,300</div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">One-time payment · Activates after admin approval.</p>
      </section>

      <div className="mt-4 rounded-2xl border border-yellow-500/50 bg-yellow-500/5 p-4 flex items-start gap-3 ex-fade-up ex-delay-4">
        <AlertTriangle size={20} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          Payment is by <span className="font-bold">bank transfer only</span>. Do <span className="font-bold">NOT</span> pay with Opay — payments from Opay will not be received and cannot be refunded.
        </p>
      </div>

      <div className="mt-5 mb-28 grid grid-cols-2 gap-3 ex-fade-up ex-delay-5">
        <Link to="/dashboard" className="rounded-full bg-background text-foreground font-semibold py-4 border border-border text-center transition hover:scale-[1.02]">
          Cancel
        </Link>
        <button
          onClick={() => nav({ to: "/pay-transfer" })}
          className="rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary ex-pulse-glow inline-flex items-center justify-center gap-2 transition hover:scale-[1.02]"
        >
          <KeyRound size={16} /> Continue to payment
        </button>
      </div>

    </MobileFrame>
  );
}
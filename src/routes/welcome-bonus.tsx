import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft, Gift, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useEtherum, formatNaira } from "@/lib/wallet";

const BONUS = 50000;

export const Route = createFileRoute("/welcome-bonus")({
  head: () => ({ meta: [{ title: "Welcome bonus — ETHERUM" }] }),
  component: WelcomeBonus,
});

function WelcomeBonus() {
  const { state, update, credit } = useEtherum();
  const [credited, setCredited] = useState(state.welcomeClaimed);
  const nav = useNavigate();

  function claim() {
    if (!state.welcomeClaimed) {
      credit("Welcome bonus", BONUS);
      update({ welcomeClaimed: true });
    }
    setCredited(true);
  }

  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/" className="grid place-items-center size-11 rounded-full bg-card border border-border">
          <ArrowLeft size={18} />
        </Link>
        <div className="grid place-items-center size-11 rounded-full bg-card border border-primary/30">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Welcome bonus</h1>
          <p className="text-sm text-muted-foreground">Claim your sign-up reward</p>
        </div>
      </header>
      <div className="my-5 h-px bg-border" />

      <div className="rounded-3xl border border-primary/25 bg-card/50 p-6 glow-soft">
        {!credited ? (
          <>
            <div className="grid place-items-center my-4">
              <div className="size-36 rounded-full grid place-items-center bg-primary/10 border border-primary/30">
                <Gift size={56} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mt-4">{formatNaira(BONUS)} is waiting</h2>
            <p className="text-center text-muted-foreground mt-4 leading-relaxed">
              Tap the button below to credit your welcome bonus to your ETHERUM wallet. You must claim to continue.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-background/40 p-4 flex items-center gap-3">
              <Gift size={28} className="text-primary" />
              <div className="flex-1">
                <div className="font-semibold">Welcome bonus</div>
                <div className="text-xs text-muted-foreground">Credited instantly to your balance</div>
              </div>
              <div className="font-bold">{formatNaira(BONUS)}</div>
            </div>
            <button onClick={claim} className="mt-6 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary">
              Claim {formatNaira(BONUS)}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3">You must claim your welcome bonus to continue using ETHERUM.</p>
          </>
        ) : (
          <>
            <div className="grid place-items-center my-6">
              <div className="size-32 rounded-full grid place-items-center bg-primary/10 border border-primary/40">
                <CheckCircle2 size={64} className="text-primary" strokeWidth={1.8} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center">Bonus credited</h2>
            <p className="text-center text-muted-foreground mt-3">{formatNaira(BONUS)} has been added to your balance.</p>
            <button onClick={() => nav({ to: "/dashboard" })} className="mt-8 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary">
              Continue to ETHERUM
            </button>
          </>
        )}
      </div>
    </MobileFrame>
  );
}
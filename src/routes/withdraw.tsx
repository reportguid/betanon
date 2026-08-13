import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft, ShieldAlert, Lock, ArrowUpRight, Copy, CheckCircle2 } from "lucide-react";
import { useEtherum, formatNaira } from "@/lib/wallet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — ETHERUM" }] }),
  component: Withdraw,
});

function Withdraw() {
  const { state } = useEtherum();
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);
  const { data: approved } = useQuery({
    queryKey: ["approved-deposit", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("deposits")
        .select("id, fpc_code, amount, approved_at")
        .eq("user_id", uid!)
        .eq("status", "approved")
        .not("fpc_code", "is", null)
        .order("approved_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any;
    },
  });

  if (approved?.fpc_code) {
    return (
      <MobileFrame>
        <header className="flex items-center gap-4">
          <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Withdraw</h1>
            <p className="text-sm text-muted-foreground">Your account is unlocked</p>
          </div>
        </header>

        <div className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-6 glow-soft">
          <div className="text-xs tracking-widest text-muted-foreground">AVAILABLE BALANCE</div>
          <div className="text-3xl font-bold mt-2">{formatNaira(state.balance)}</div>
        </div>

        <div className="mt-5 rounded-3xl border border-primary/40 bg-card/70 p-6 glow-primary text-center">
          <div className="grid place-items-center my-2">
            <div className="size-16 rounded-full grid place-items-center bg-primary/15 border border-primary/40">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
          </div>
          <div className="text-xs tracking-widest text-muted-foreground mt-2">YOUR FPC CODE</div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="text-2xl font-bold font-mono text-primary tracking-wider">{approved.fpc_code}</div>
            <button
              onClick={() => { navigator.clipboard.writeText(approved.fpc_code); toast.success("Code copied"); }}
              className="grid place-items-center size-10 rounded-lg bg-primary/15 border border-primary/30 hover:bg-primary/25 transition"
            >
              <Copy size={16} className="text-primary" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Use this code with support to process your bank payout.</p>
          <Link to="/support" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary hover:scale-[1.02] transition">
            Continue to withdrawal
          </Link>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Withdraw</h1>
          <p className="text-sm text-muted-foreground">Cash out to your bank</p>
        </div>
      </header>

      <div className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-6 glow-soft">
        <div className="text-xs tracking-widest text-muted-foreground">AVAILABLE BALANCE</div>
        <div className="text-3xl font-bold mt-2">{formatNaira(state.balance)}</div>
      </div>

      <div className="mt-5 rounded-3xl border border-primary/30 bg-card/70 p-6 glow-soft ex-pop">
        <div className="grid place-items-center my-3">
          <div className="size-20 rounded-full grid place-items-center bg-primary/10 border border-primary/30 ex-pulse-glow">
            <ShieldAlert size={36} className="text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center">Verification required</h2>
        <p className="text-center text-muted-foreground mt-3 leading-relaxed">
          Your account is on the <span className="text-foreground font-semibold">Free tier</span>. To withdraw funds securely to your bank, upgrade your account to unlock instant payouts.
        </p>

        <ul className="mt-5 space-y-3 text-sm">
          {["Instant bank transfers", "Higher daily withdrawal limit", "Priority support & dispute resolution"].map((s, i) => (
            <li key={s} className={`flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 ex-slide-up ex-delay-${i + 1}`}>
              <Lock size={16} className="text-primary" /> {s}
            </li>
          ))}
        </ul>

        <Link to="/buy-token" className="mt-6 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 flex items-center justify-center gap-2 glow-primary ex-pulse-glow transition hover:scale-[1.02]">
          <ArrowUpRight size={18} /> Buy ETHERUM Token
        </Link>
        <p className="text-center text-xs text-muted-foreground mt-3">Your balance is safe and will remain available after upgrade.</p>
      </div>
    </MobileFrame>
  );
}
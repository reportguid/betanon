import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft, Lock, CheckCircle2, Circle, Landmark, ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { getWithdrawalEligibility, submitWithdrawal } from "@/lib/etherum.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw — ETHERUM" },
      { name: "description", content: "Review your ETHERUM withdrawal eligibility and request a payout to a verified bank account." },
      { property: "og:title", content: "Withdraw — ETHERUM" },
      { property: "og:description", content: "Withdrawals require verified referrals, identity, bank verification and active membership." },
    ],
  }),
  component: Withdraw,
});

function Withdraw() {
  const qc = useQueryClient();
  const fetchEligibility = useServerFn(getWithdrawalEligibility);
  const requestWithdrawal = useServerFn(submitWithdrawal);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: e, isLoading } = useQuery({
    queryKey: ["withdrawal-eligibility"],
    queryFn: () => fetchEligibility({ data: undefined as never }),
  });

  async function submit() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { toast.error("Enter a valid amount"); return; }
    setBusy(true);
    try {
      const res = await requestWithdrawal({ data: { amount: value } });
      if (!res.ok) { res.reasons.forEach((r) => toast.error(r)); return; }
      toast.success("Withdrawal request submitted for review");
      setAmount("");
      qc.invalidateQueries({ queryKey: ["withdrawal-eligibility"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Withdraw</h1>
          <p className="text-sm text-muted-foreground">Payout to a verified bank account</p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 ex-fade-up">
        <div className="rounded-3xl border border-primary/25 bg-card/60 p-5 glow-soft">
          <div className="text-[11px] tracking-widest text-muted-foreground">WITHDRAWABLE</div>
          <div className="text-2xl font-bold mt-1 font-num">{formatNaira(e?.withdrawableBalance ?? 0)}</div>
        </div>
        <div className="rounded-3xl border border-border bg-card/40 p-5">
          <div className="text-[11px] tracking-widest text-muted-foreground flex items-center gap-1"><Lock size={11} /> LOCKED REWARD</div>
          <div className="text-2xl font-bold mt-1 font-num text-muted-foreground">{formatNaira(e?.lockedReward ?? 30000)}</div>
          <div className="text-[11px] text-muted-foreground capitalize mt-1">{(e?.rewardStatus ?? "locked").replace("_", " ")}</div>
        </div>
      </div>

      <section className="mt-4 rounded-3xl border border-border bg-card/50 p-5 ex-fade-up ex-delay-1">
        <h2 className="font-semibold flex items-center gap-2"><ShieldCheck size={18} className="text-primary" /> Eligibility checklist</h2>
        <ul className="mt-4 space-y-2.5 text-sm">
          <Req
            done={(e?.verifiedReferrals ?? 0) >= (e?.requiredReferrals ?? 17)}
            label={`${e?.verifiedReferrals ?? 0} of ${e?.requiredReferrals ?? 17} verified referrals`}
            to="/refer"
            action="Invite"
          />
          <Req done={!!e?.identityVerified} label="Identity verification complete" to="/profile" action="Verify" />
          <Req done={!!e?.bankVerified} label="Bank account verified" to="/profile" action="Add bank" />
          <Req done={!!e?.membershipActive} label="ETHERUM Premium Membership active" to="/upgrade" action="Activate" />
        </ul>
        {isLoading && <p className="text-xs text-muted-foreground mt-3">Checking your account…</p>}
      </section>

      {e?.eligible ? (
        <section className="mt-4 mb-28 rounded-3xl border border-primary/40 bg-card/70 p-5 glow-primary ex-fade-up ex-delay-2">
          <h2 className="font-semibold flex items-center gap-2"><Landmark size={18} className="text-primary" /> Request payout</h2>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(ev) => setAmount(ev.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="Amount (₦)"
            className="mt-4 w-full rounded-2xl border border-border bg-background/50 px-4 py-3.5 font-num outline-none focus:border-primary/60"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary transition hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit withdrawal request"}
          </button>
          <p className="text-xs text-muted-foreground mt-3">Every request is manually reviewed by an administrator before payout.</p>
        </section>
      ) : (
        <section className="mt-4 mb-28 rounded-3xl border border-border bg-card/50 p-5 ex-fade-up ex-delay-2">
          <h2 className="font-semibold">Withdrawals are locked</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(e?.unmetRequirements ?? ["Loading your requirements…"]).map((r) => (
              <li key={r} className="rounded-xl border border-border bg-background/40 px-4 py-3">{r}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Meeting every requirement does not guarantee approval — all withdrawals are subject to administrative review.
          </p>
        </section>
      )}
    </MobileFrame>
  );
}

function Req({ done, label, to, action }: { done: boolean; label: string; to: string; action: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3">
      {done ? <CheckCircle2 size={17} className="text-primary shrink-0" /> : <Circle size={17} className="text-muted-foreground shrink-0" />}
      <span className={`flex-1 ${done ? "" : "text-muted-foreground"}`}>{label}</span>
      {!done && <Link to={to} className="text-xs font-semibold text-primary">{action}</Link>}
    </li>
  );
}

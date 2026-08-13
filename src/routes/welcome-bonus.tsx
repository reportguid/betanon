import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft, Lock, Sparkles, Users } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { getReferralSummary } from "@/lib/etherum.functions";

export const Route = createFileRoute("/welcome-bonus")({
  head: () => ({
    meta: [
      { title: "Conditional promotional reward — ETHERUM" },
      { name: "description", content: "Your ₦30,000 ETHERUM promotional reward is locked until 17 referrals are verified and reviewed." },
      { property: "og:title", content: "Conditional promotional reward — ETHERUM" },
      { property: "og:description", content: "A locked promotional reward, held separately from your withdrawable balance." },
    ],
  }),
  component: WelcomeReward,
});

function WelcomeReward() {
  const nav = useNavigate();
  const fetchSummary = useServerFn(getReferralSummary);
  const { data } = useQuery({
    queryKey: ["referral-summary"],
    queryFn: () => fetchSummary({ data: undefined as never }),
  });
  const amount = data?.rewardAmount ?? 30000;
  const required = data?.required ?? 17;
  const verified = data?.verified ?? 0;
  const pct = Math.min(100, Math.round((verified / required) * 100));

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
          <h1 className="text-xl font-bold">Promotional reward</h1>
          <p className="text-sm text-muted-foreground">Conditional and locked</p>
        </div>
      </header>
      <div className="my-5 h-px bg-border" />

      <div className="rounded-3xl border border-primary/25 bg-card/50 p-6 glow-soft ex-fade-up">
        <div className="grid place-items-center my-4">
          <div className="size-32 rounded-full grid place-items-center bg-primary/10 border border-primary/30">
            <Lock size={52} className="text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mt-2 font-num">{formatNaira(amount)} Conditional Promotional Reward</h2>
        <p className="text-center text-muted-foreground mt-4 leading-relaxed">
          This is a locked promotional reward. You need {required} verified referrals before it can be submitted for
          administrative eligibility review.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-background/40 p-4">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary" />
            <div className="flex-1 text-sm">Verified referrals</div>
            <div className="font-bold font-num">{verified} of {required}</div>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-background/60 overflow-hidden border border-border">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          The promotional reward is held separately from your withdrawable balance. It is not available cash, and
          reaching {required} verified referrals does not guarantee approval — every reward is reviewed by an administrator.
        </p>

        <button onClick={() => nav({ to: "/refer" })} className="mt-6 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary transition hover:scale-[1.02]">
          Invite people
        </button>
        <button onClick={() => nav({ to: "/dashboard" })} className="mt-3 w-full rounded-full border border-border py-3 font-medium transition hover:bg-card">
          Continue to dashboard
        </button>
      </div>
    </MobileFrame>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft, Copy, Share2, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getReferralSummary } from "@/lib/etherum.functions";
import { formatNaira } from "@/lib/wallet";

export const Route = createFileRoute("/refer")({
  head: () => ({
    meta: [
      { title: "Referrals — ETHERUM" },
      { name: "description", content: "Share your permanent ETHERUM referral link and track verified, pending and rejected referrals." },
      { property: "og:title", content: "Referrals — ETHERUM" },
      { property: "og:description", content: "Track your verified referrals toward the ETHERUM promotional reward review." },
    ],
  }),
  component: Refer,
});

function Refer() {
  const fetchSummary = useServerFn(getReferralSummary);
  const { data, isLoading } = useQuery({
    queryKey: ["referral-summary"],
    queryFn: () => fetchSummary({ data: undefined as never }),
  });

  const code = data?.referralCode ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = code ? `${origin}/signup?ref=${code}` : "";
  const required = data?.required ?? 17;
  const verified = data?.verified ?? 0;
  const pct = Math.min(100, Math.round((verified / required) * 100));

  async function share() {
    if (!link) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "ETHERUM", text: "Join me on ETHERUM", url: link }); return; } catch { /* cancelled */ }
    }
    navigator.clipboard?.writeText(link);
    toast.success("Referral link copied");
  }

  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold">Referrals</h1>
          <p className="text-sm text-muted-foreground">Your permanent referral code</p>
        </div>
      </header>

      <section className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-6 glow-soft ex-fade-up">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-primary" />
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Verified referrals</div>
            <div className="text-3xl font-bold font-num">{verified} <span className="text-lg text-muted-foreground">of {required}</span></div>
          </div>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-background/60 overflow-hidden border border-border">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          A referral counts only after the referred member registers with your link, verifies their email, passes duplicate-account checks and is approved by an administrator. Referred members are never required to buy anything.
        </p>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3 ex-fade-up ex-delay-1">
        <Stat icon={<CheckCircle2 size={16} className="text-primary" />} label="Verified" value={verified} />
        <Stat icon={<Clock size={16} className="text-accent" />} label="Pending" value={data?.pending ?? 0} />
        <Stat icon={<XCircle size={16} className="text-destructive" />} label="Rejected" value={data?.rejected ?? 0} />
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-card/50 p-4 ex-fade-up ex-delay-2">
        <div className="text-[11px] tracking-widest text-muted-foreground">REFERRAL REWARD</div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-2xl font-bold font-num">{formatNaira(data?.rewardAmount ?? 30000)}</div>
          <span className="text-xs rounded-full border border-border px-3 py-1 capitalize">{(data?.rewardStatus ?? "locked").replace("_", " ")}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Locked promotional reward — separate from your withdrawable balance.</p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-background/40 p-4 ex-fade-up ex-delay-3">
        <div className="text-[11px] tracking-widest text-muted-foreground">YOUR PERMANENT CODE</div>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-lg flex-1 truncate">{isLoading ? "…" : code || "—"}</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(link || code); toast.success("Referral link copied"); }}
            className="rounded-full bg-primary text-primary-foreground font-bold px-4 py-2 text-sm inline-flex items-center gap-2 transition hover:scale-105"
          >
            <Copy size={14} /> Copy
          </button>
          <button onClick={share} className="rounded-full border border-border px-4 py-2 text-sm inline-flex items-center gap-2 transition hover:bg-card">
            <Share2 size={14} /> Share
          </button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground break-all">{link}</div>
      </section>

      <section className="mt-4 mb-28 rounded-2xl border border-border bg-card/50 p-4 ex-fade-up ex-delay-4">
        <h2 className="font-semibold">Referral history</h2>
        <div className="mt-3 space-y-2">
          {(data?.history ?? []).length === 0 && <p className="text-sm text-muted-foreground">No referrals yet.</p>}
          {(data?.history ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
              <span className="text-xs capitalize">{r.status}</span>
            </div>
          ))}
        </div>
      </section>
    </MobileFrame>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-3 text-center">
      <div className="grid place-items-center">{icon}</div>
      <div className="text-xl font-bold font-num mt-1">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

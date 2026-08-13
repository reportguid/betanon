import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { Sparkles, Play, Users, Share2, Clock, X } from "lucide-react";
import { useEtherum, formatNaira } from "@/lib/wallet";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — ETHERUM" }] }),
  component: Tasks,
});

const CLAIM_KEY = "etherum_daily_claim";
const AD_SECONDS = 15;
const tasks = [
  { id: "tap", title: "Tap & Earn", desc: "Watch a short ad to claim your daily bonus", reward: 750, Icon: Sparkles, daily: true },
  { id: "invite", title: "Invite a friend", desc: "Earn when they sign up", reward: 2000, Icon: Users, daily: false },
  { id: "share", title: "Share ETHERUM", desc: "Post on social media", reward: 300, Icon: Share2, daily: false },
] as const;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function nextResetLabel() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Tasks() {
  const { credit } = useEtherum();
  const [claimedToday, setClaimedToday] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [remaining, setRemaining] = useState(AD_SECONDS);
  const [pending, setPending] = useState<{ title: string; reward: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setClaimedToday(localStorage.getItem(CLAIM_KEY) === todayKey());
  }, []);

  useEffect(() => {
    if (!adOpen) return;
    setRemaining(AD_SECONDS);
    const t = setInterval(() => setRemaining((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(t);
  }, [adOpen]);

  function startDailyClaim(t: { title: string; reward: number }) {
    if (claimedToday) {
      toast.error(`Already claimed today. Come back after ${nextResetLabel()}`);
      return;
    }
    setPending(t);
    setAdOpen(true);
  }
  function finishAd() {
    if (remaining > 0 || !pending) return;
    credit(pending.title, pending.reward);
    if (typeof window !== "undefined") localStorage.setItem(CLAIM_KEY, todayKey());
    setClaimedToday(true);
    setAdOpen(false);
    setPending(null);
    toast.success(`+${formatNaira(pending.reward)} credited to your wallet`);
  }

  return (
    <MobileFrame>
      <h1 className="text-2xl font-bold">Daily tasks</h1>
      <p className="text-sm text-muted-foreground">Complete tasks, grow your balance.</p>

      {claimedToday && (
        <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-3 flex items-center gap-3 text-xs">
          <Clock size={14} className="text-primary" />
          <span className="text-muted-foreground">
            Daily bonus claimed. Next claim resets at <span className="text-foreground font-semibold">{nextResetLabel()}</span>.
          </span>
        </div>
      )}

      <ul className="mt-6 space-y-3 mb-28">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/50 p-4">
            <div className="grid place-items-center size-11 rounded-xl bg-primary/15 border border-primary/30">
              <t.Icon size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.desc} · <span className="text-primary">+{formatNaira(t.reward)}</span></div>
            </div>
            {t.daily ? (
              <button
                disabled={claimedToday}
                onClick={() => startDailyClaim(t)}
                className="rounded-full bg-primary text-primary-foreground font-bold px-4 py-2 text-sm glow-soft disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {claimedToday ? "Claimed" : "Watch & Claim"}
              </button>
            ) : (
              <button
                onClick={() => { credit(t.title, t.reward); toast.success(`+${formatNaira(t.reward)} credited`); }}
                className="rounded-full bg-primary text-primary-foreground font-bold px-4 py-2 text-sm glow-soft"
              >
                Claim
              </button>
            )}
          </li>
        ))}
      </ul>

      {adOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-primary/30 bg-card p-5 glow-primary animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold tracking-widest text-primary">SPONSORED</div>
              <button
                onClick={() => { if (remaining === 0) setAdOpen(false); }}
                disabled={remaining > 0}
                className="grid place-items-center size-8 rounded-full bg-background/60 border border-border disabled:opacity-30"
                aria-label="Close"
              ><X size={14} /></button>
            </div>
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-background border border-primary/30 grid place-items-center overflow-hidden relative">
              <Play size={64} className="text-primary opacity-70" />
              <div className="absolute bottom-3 left-3 right-3 text-center text-xs text-muted-foreground">
                Watch to unlock your daily reward
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {remaining > 0 ? `Reward unlocks in ${remaining}s` : "Reward ready!"}
              </span>
              <span className="text-primary font-bold">+{formatNaira(pending?.reward ?? 0)}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-background/60 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${((AD_SECONDS - remaining) / AD_SECONDS) * 100}%` }} />
            </div>
            <button
              onClick={finishAd}
              disabled={remaining > 0}
              className="mt-4 w-full rounded-full bg-primary text-primary-foreground font-bold py-3 disabled:opacity-40 disabled:cursor-not-allowed glow-primary transition"
            >
              {remaining > 0 ? `Please wait… ${remaining}s` : "Claim Reward"}
            </button>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
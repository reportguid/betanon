import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { Sparkles, Play, Users, Share2 } from "lucide-react";
import { useEtherox, formatNaira } from "@/lib/wallet";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — BETANO" }] }),
  component: Tasks,
});

const tasks = [
  { id: "tap", title: "Tap & Earn", desc: "Tap to claim your daily bonus", reward: 750, Icon: Sparkles },
  { id: "watch", title: "Watch a short video", desc: "30s sponsored clip", reward: 500, Icon: Play },
  { id: "invite", title: "Invite a friend", desc: "Earn when they sign up", reward: 2000, Icon: Users },
  { id: "share", title: "Share BETANO", desc: "Post on social media", reward: 300, Icon: Share2 },
];

function Tasks() {
  const { credit } = useEtherox();
  return (
    <MobileFrame>
      <h1 className="text-2xl font-bold">Daily tasks</h1>
      <p className="text-sm text-muted-foreground">Complete tasks, grow your balance.</p>

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
            <button
              onClick={() => { credit(t.title, t.reward); toast.success(`+${formatNaira(t.reward)} credited`); }}
              className="rounded-full bg-primary text-primary-foreground font-bold px-4 py-2 text-sm glow-soft"
            >
              Claim
            </button>
          </li>
        ))}
      </ul>
    </MobileFrame>
  );
}
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { User as UserIcon, LogOut, Shield, Gift, HelpCircle, MessagesSquare, ChevronRight, Sparkles } from "lucide-react";
import { useEtherox, formatNaira } from "@/lib/wallet";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — BETANO" }] }),
  component: Profile,
});

function Profile() {
  const { state, update, signOut } = useEtherox();
  const nav = useNavigate();
  return (
    <MobileFrame>
      <div className="flex items-center gap-4">
        <div className="grid place-items-center size-16 rounded-full border-2 border-primary/60 bg-card">
          <UserIcon size={28} />
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold">{state.fullName || "BETANO user"}</div>
          <div className="text-sm text-muted-foreground">{state.email || "Not signed in"}</div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-primary/25 bg-card/60 p-5">
        <div className="text-xs tracking-widest text-muted-foreground">BALANCE</div>
        <div className="text-3xl font-bold mt-1 font-num">{formatNaira(state.balance)}</div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card/40 p-4 flex items-center gap-3">
        <div className="grid place-items-center size-10 rounded-full bg-primary/15 border border-primary/30">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">Reduce motion</div>
          <div className="text-xs text-muted-foreground">Simplify modal, toast & page transitions</div>
        </div>
        <button
          role="switch"
          aria-checked={state.reduceMotion}
          aria-label="Toggle reduce motion"
          onClick={() => update({ reduceMotion: !state.reduceMotion })}
          className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${state.reduceMotion ? "bg-primary border-primary" : "bg-background border-border"}`}
        >
          <span className={`inline-block size-5 rounded-full bg-foreground transition-transform ${state.reduceMotion ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <ul className="mt-5 space-y-3 mb-28">
        {[
          { to: "/refer", label: "Refer & Earn", Icon: Gift },
          { to: "/upgrade", label: "Upgrade account", Icon: Shield },
          { to: "/faq", label: "FAQ", Icon: HelpCircle },
          { to: "/support", label: "Support", Icon: MessagesSquare },
        ].map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4">
              <i.Icon size={18} className="text-primary" />
              <span className="flex-1 font-semibold">{i.label}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={() => { signOut(); nav({ to: "/" }); }}
            className="w-full flex items-center gap-3 rounded-2xl border border-destructive/40 bg-card/40 p-4 text-destructive font-semibold"
          >
            <LogOut size={18} /> Sign out
          </button>
        </li>
      </ul>
    </MobileFrame>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { Bell, User as UserIcon, ArrowUpRight, Sparkles, TrendingUp, Gift, HelpCircle, MessagesSquare, ShieldCheck, Lock, ArrowDownRight, X, ShieldCheck as Shield2, CheckCircle2, WifiOff, AlertTriangle } from "lucide-react";
import { useEtherum, formatNaira } from "@/lib/wallet";
import { useEffect, useState } from "react";
import { BalanceSkeleton, TileSkeleton, TxnRowSkeleton, EmptyState, ErrorState } from "@/components/etherum/Skeletons";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ETHERUM" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { state, update, credit } = useEtherum();
  const [showSurprise, setShowSurprise] = useState(false);
  const [reward, setReward] = useState(0);
  const [credited, setCredited] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [tilesError, setTilesError] = useState<string | null>(null);
  const [txnsError, setTxnsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
  const displayName = "there";

  useEffect(() => {
    setLoading(true);
    setBalanceError(null);
    setTilesError(null);
    setTxnsError(null);
    const t = setTimeout(() => {
      try {
        if (typeof window === "undefined") throw new Error("SSR");
        // sanity check: wallet state must be readable
        window.localStorage.getItem("etherum_state_v1");
        setLoading(false);
      } catch (e: any) {
        const msg = e?.message || "Unknown error";
        setBalanceError(`Couldn't load your wallet balance. ${msg}. Check your connection and try again.`);
        setTilesError(`Couldn't load your quick actions. ${msg}.`);
        setTxnsError(`Couldn't load your transactions. ${msg}.`);
        setLoading(false);
      }
    }, 650);
    return () => clearTimeout(t);
  }, [reloadKey]);

  const retry = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (state.welcomeClaimed && !state.surpriseShown) {
      const r = 5000 + Math.floor(Math.random() * 21) * 1000;
      setReward(r);
      const t = setTimeout(() => setShowSurprise(true), 800);
      return () => clearTimeout(t);
    }
  }, [state.welcomeClaimed, state.surpriseShown]);

  function claimSurprise() {
    credit("Surprise bonus", reward);
    update({ surpriseShown: true });
    setCredited(true);
  }

  function closeSurprise() {
    setClosing(true);
    update({ surpriseShown: true });
    setTimeout(() => {
      setShowSurprise(false);
      setClosing(false);
    }, 220);
  }

  return (
    <MobileFrame>
      <header className="flex items-center justify-between">
        <Link to="/profile" aria-label="Profile" className="grid place-items-center size-11 rounded-full border-2 border-primary/60 bg-card hover:bg-card/80 transition-colors shrink-0">
          <UserIcon size={18} />
        </Link>
        <div className="flex-1 min-w-0 px-3 leading-tight">
          <div className="text-[10px] tracking-[0.25em] text-muted-foreground font-medium">{greeting.toUpperCase()}</div>
          <div className="text-sm font-semibold truncate">Hi, {displayName} 👋</div>
        </div>
        <button aria-label="Notifications" className="relative grid place-items-center size-11 rounded-full border border-border bg-card hover:bg-card/80 transition-colors shrink-0">
          <Bell size={18} />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-background" />
        </button>
      </header>

      {loading ? <BalanceSkeleton /> : balanceError ? (
        <div className="mt-6">
          <ErrorState
            icon={<WifiOff size={20} />}
            title="Balance unavailable"
            message={balanceError}
            onRetry={retry}
          />
        </div>
      ) : (
      <section className="mt-6 relative overflow-hidden rounded-[2rem] border border-primary/30 p-6 glow-soft ex-slide-up"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.09 290 / 0.85) 0%, oklch(0.15 0.05 265 / 0.75) 55%, oklch(0.13 0.03 265 / 0.9) 100%)" }}>
        <div className="absolute -top-16 -right-16 size-52 rounded-full bg-primary/20 blur-3xl pointer-events-none ex-pulse-glow" />
        <div className="absolute -bottom-20 -left-10 size-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <span className="text-[10px] tracking-[0.28em] text-primary/80 font-bold">AVAILABLE BALANCE</span>
          <button onClick={() => setHidden(!hidden)} aria-label={hidden ? "Show balance" : "Hide balance"} className="text-primary/60 hover:text-primary transition-colors">
            <EyeIcon hidden={hidden} />
          </button>
        </div>
        <div className="relative mt-3 flex items-baseline gap-1">
          <span className="font-num text-5xl leading-none font-bold text-foreground text-glow">
            {hidden ? "₦••••••" : formatNaira(Math.floor(state.balance))}
          </span>
          {!hidden && <span className="font-num text-2xl leading-none font-semibold text-primary/40">.00</span>}
        </div>
        <div className="relative mt-6 flex items-end justify-between gap-3">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Naira wallet</span>
            <span className="text-xs font-semibold text-foreground/90">NGN Account</span>
          </div>
          <button onClick={() => nav({ to: "/withdraw" })} className="rounded-full bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 flex items-center gap-1.5 glow-primary hover:scale-[1.04] active:scale-95 transition-transform">
            Withdraw <ArrowUpRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </section>
      )}

      {loading ? (
        <div className="mt-4"><TileSkeleton /></div>
      ) : tilesError ? null : (
      <Link to="/tasks" className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/50 p-4 hover:border-primary/50 transition-colors group">
        <div className="grid place-items-center size-10 rounded-full bg-primary/15 border border-primary/30 group-hover:scale-110 transition-transform">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">Tap & Earn</div>
          <div className="text-xs text-muted-foreground">Earn <span className="text-primary font-num font-semibold">+₦750</span> in seconds</div>
        </div>
        <span className="text-[10px] font-bold tracking-wider rounded-full bg-primary/15 text-primary px-3 py-1 border border-primary/30">READY</span>
      </Link>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {loading ? (
          <>
            <TileSkeleton /><TileSkeleton /><TileSkeleton /><TileSkeleton />
          </>
        ) : tilesError ? (
          <div className="col-span-2">
            <ErrorState
              icon={<AlertTriangle size={20} />}
              title="Quick actions failed to load"
              message={tilesError}
              onRetry={retry}
            />
          </div>
        ) : (
          <>
            <Tile to="/buy-token" Icon={TrendingUp} label="Buy ETHERUM Token" size="lg" delay="ex-delay-1" featured />
            <Tile to="/refer" Icon={Gift} label="Refer & Earn" size="lg" delay="ex-delay-2" />
            <Tile to="/faq" Icon={HelpCircle} label="FAQ" size="sm" delay="ex-delay-3" />
            <Tile to="/support" Icon={MessagesSquare} label="Support" size="sm" delay="ex-delay-4" />
          </>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-primary/25 bg-card/50 p-4 flex items-center gap-3">
        <div className="grid place-items-center size-10 rounded-full bg-primary/15 border border-primary/30">
          <ShieldCheck size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm flex items-center gap-1.5">Encrypted & Secure <Lock size={12} /></div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">256-bit SSL · PCI-DSS · ETHERUM Secure Vault</div>
        </div>
      </div>

      <section className="mt-5 rounded-3xl border border-border bg-card/40 p-5 mb-28">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Recent activity</h2>
            <p className="text-[11px] text-muted-foreground">Your latest transactions</p>
          </div>
          <Link to="/history" className="text-primary text-xs font-semibold hover:underline">See all ›</Link>
        </div>
        <ul className="mt-4 space-y-2.5">
          {loading ? (
            <>
              <li><TxnRowSkeleton /></li>
              <li><TxnRowSkeleton /></li>
              <li><TxnRowSkeleton /></li>
            </>
          ) : txnsError ? (
            <li>
              <ErrorState
                icon={<AlertTriangle size={20} />}
                title="Couldn't load activity"
                message={txnsError}
                onRetry={retry}
              />
            </li>
          ) : state.txns.length === 0 ? (
            <li>
              <EmptyState
                icon={<Sparkles size={18} />}
                title="No activity yet"
                message="Complete a task or claim your welcome bonus — it will land here in real time."
                action={
                  <Link to="/tasks" className="rounded-full bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 glow-soft">
                    Earn your first ₦
                  </Link>
                }
              />
            </li>
          ) : state.txns.slice(0, 4).map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-background/40 transition-colors">
              <div className="grid place-items-center size-10 rounded-xl border border-primary/30 bg-background/40">
                <ArrowDownRight size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{t.title}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(t.ts).toLocaleString()}</div>
              </div>
              <div className="font-num font-bold text-primary text-sm">+{formatNaira(t.amount)}</div>
            </li>
          ))}
        </ul>
      </section>

      {showSurprise && (
        <SurpriseModal
          reward={reward}
          credited={credited}
          closing={closing}
          onClaim={claimSurprise}
          onClose={closeSurprise}
        />
      )}

    </MobileFrame>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 3 18 18"/><path d="M10.5 10.7a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A10 10 0 0 1 22 12a13 13 0 0 1-2.6 3.4M6.1 6.1A13 13 0 0 0 2 12a10 10 0 0 0 13.9 6"/></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}

function Tile({ to, Icon, label, size = "lg", delay, featured }: { to: string; Icon: any; label: string; size?: "lg" | "sm"; delay?: string; featured?: boolean }) {
  const isLg = size === "lg";
  return (
    <Link
      to={to}
      className={`ex-fade-up ${delay ?? ""} relative overflow-hidden rounded-3xl border ${featured ? "border-primary/40" : "border-primary/15"} bg-card/50 hover:bg-card/70 hover:border-primary/50 transition-all group active:scale-[0.97] ${isLg ? "p-4 aspect-square flex flex-col justify-between" : "px-4 py-4 flex items-center gap-3"}`}
    >
      {featured && <div className="absolute -top-8 -right-8 size-24 rounded-full bg-primary/15 blur-2xl pointer-events-none" />}
      {featured && <span className="absolute top-3 right-3 text-[9px] font-bold tracking-widest text-primary/90 uppercase rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5">Unlock</span>}
      <div className={`relative grid place-items-center ${isLg ? "size-10 rounded-xl" : "size-9 rounded-xl"} bg-primary/10 border border-primary/25 group-hover:scale-110 group-hover:bg-primary/20 transition-all`}>
        <Icon size={isLg ? 18 : 16} className="text-primary" strokeWidth={2} />
      </div>
      <span className="relative font-semibold text-sm leading-tight">{label}</span>
    </Link>
  );
}

function SurpriseModal({ reward, credited, closing, onClaim, onClose }: { reward: number; credited: boolean; closing: boolean; onClaim: () => void; onClose: () => void }) {
  return (
    <div className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-5 ${closing ? "ex-overlay-out" : "ex-overlay-in"}`}>
      <div className={`relative w-full max-w-md rounded-3xl border border-primary/25 bg-card/95 p-6 glow-primary ${closing ? "ex-modal-out" : "ex-modal-in"}`}>
        <button onClick={onClose} className="absolute right-4 top-4 grid place-items-center size-9 rounded-full bg-background/60 border border-border">
          <X size={16} />
        </button>

        {!credited ? (
          <>
            <div className="grid place-items-center mt-2">
              <div className="size-24 rounded-2xl grid place-items-center bg-primary glow-primary">
                <Gift size={44} className="text-primary-foreground" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-primary text-xs font-bold tracking-widest">
                <Sparkles size={14} /> SURPRISE DROP
              </span>
            </div>
            <h3 className="text-center text-2xl font-bold mt-3">A bonus is waiting</h3>
            <p className="text-center text-muted-foreground mt-2">You've unlocked a free reward. Tap claim to credit it to your ETHERUM wallet instantly.</p>

            <div className="mt-5 rounded-2xl border border-border bg-background/50 px-5 py-6 text-center">
              <div className="text-xs tracking-widest text-muted-foreground">YOUR REWARD</div>
              <div className="text-5xl font-bold mt-2">{formatNaira(reward)}</div>
              <div className="text-xs text-muted-foreground mt-2">Bonuses range from ₦5,000 – ₦25,000</div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background/40 px-4 py-3 flex items-start gap-3">
              <Shield2 size={18} className="text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">100% safe. Bonus is credited from ETHERUM — no fees, no card details required.</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={onClose} className="rounded-full bg-background text-foreground font-semibold py-3.5 border border-border">Maybe later</button>
              <button onClick={onClaim} className="rounded-full bg-primary text-primary-foreground font-bold py-3.5 glow-primary">Claim now</button>
            </div>
          </>
        ) : (
          <>
            <div className="grid place-items-center mt-4">
              <div className="size-24 rounded-full grid place-items-center bg-primary/10 border border-primary/40">
                <CheckCircle2 size={50} className="text-primary" />
              </div>
            </div>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1.5 text-primary text-xs font-bold tracking-widest">
                <CheckCircle2 size={14} /> BONUS CREDITED
              </span>
            </div>
            <h3 className="text-center text-2xl font-bold mt-3">Reward landed</h3>
            <p className="text-center text-muted-foreground mt-2">Your surprise bonus is now in your wallet.</p>
            <div className="text-center text-4xl font-bold mt-5">+{formatNaira(reward)}</div>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 glow-primary">Awesome</button>
          </>
        )}
      </div>
    </div>
  );
}
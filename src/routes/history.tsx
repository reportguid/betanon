import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { ArrowDownRight, Receipt, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEtherox, formatNaira } from "@/lib/wallet";
import { useEffect, useState } from "react";
import { TxnRowSkeleton, EmptyState, ErrorState } from "@/components/etherox/Skeletons";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Etherox" }] }),
  component: History,
});

function History() {
  const { state } = useEtherox();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      try {
        if (typeof window === "undefined") throw new Error("SSR");
        window.localStorage.getItem("etherox_state_v1");
        setLoading(false);
      } catch (e: any) {
        setError(`We couldn't load your transaction history. ${e?.message || "Unknown error"}. Please check your connection and try again.`);
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [reloadKey]);
  const retry = () => setReloadKey((k) => k + 1);
  return (
    <MobileFrame>
      <h1 className="text-2xl font-bold">Transaction history</h1>
      <p className="text-sm text-muted-foreground">All your wallet activity</p>

      <ul className="mt-6 space-y-3 mb-28">
        {loading ? (
          <>
            <li className="rounded-2xl border border-border bg-card/30 p-3"><TxnRowSkeleton /></li>
            <li className="rounded-2xl border border-border bg-card/30 p-3"><TxnRowSkeleton /></li>
            <li className="rounded-2xl border border-border bg-card/30 p-3"><TxnRowSkeleton /></li>
            <li className="rounded-2xl border border-border bg-card/30 p-3"><TxnRowSkeleton /></li>
          </>
        ) : error ? (
          <li>
            <ErrorState
              icon={<AlertTriangle size={20} />}
              title="History unavailable"
              message={error}
              onRetry={retry}
            />
          </li>
        ) : state.txns.length === 0 ? (
          <li>
            <EmptyState
              icon={<Receipt size={18} />}
              title="Nothing here yet"
              message="Your credits, bonuses, and withdrawals will show up here as soon as they happen."
              action={
                <Link to="/tasks" className="rounded-full bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 glow-soft">
                  Start earning
                </Link>
              }
            />
          </li>
        ) : state.txns.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4">
            <div className="grid place-items-center size-11 rounded-xl border border-primary/30 bg-background/40">
              <ArrowDownRight size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(t.ts).toLocaleString()}</div>
            </div>
            <div className="font-bold text-primary">+{formatNaira(t.amount)}</div>
          </li>
        ))}
      </ul>
    </MobileFrame>
  );
}
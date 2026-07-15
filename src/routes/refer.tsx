import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { ArrowLeft, Copy, Gift } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/refer")({
  head: () => ({ meta: [{ title: "Refer & Earn — Etherox" }] }),
  component: Refer,
});

function Refer() {
  const code = "ETHX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold">Refer & Earn</h1>
      </header>

      <div className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-6 glow-soft text-center">
        <div className="grid place-items-center">
          <div className="size-20 rounded-2xl bg-primary grid place-items-center glow-primary">
            <Gift size={36} className="text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4">Earn ₦2,000 per friend</h2>
        <p className="text-muted-foreground mt-2">They get ₦1,000 sign-up bonus, you earn ₦2,000 — every time.</p>

        <div className="mt-6 rounded-2xl border border-border bg-background/40 p-4 flex items-center gap-3">
          <span className="font-mono text-lg flex-1 text-left">{code}</span>
          <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied"); }} className="rounded-full bg-primary text-primary-foreground font-bold px-4 py-2 text-sm flex items-center gap-2">
            <Copy size={14} /> Copy
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
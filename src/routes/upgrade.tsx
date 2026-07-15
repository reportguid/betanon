import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/upgrade")({
  head: () => ({ meta: [{ title: "Upgrade — Etherox" }] }),
  component: Upgrade,
});

const plans = [
  { name: "Starter", price: 2500, perks: ["Withdraw up to ₦50,000/day", "Standard support"] },
  { name: "Pro", price: 7500, perks: ["Withdraw up to ₦250,000/day", "Priority support", "2× daily task rewards"], best: true },
  { name: "Elite", price: 20000, perks: ["Unlimited withdrawals", "VIP support", "3× task rewards", "Exclusive drops"] },
];

function Upgrade() {
  return (
    <MobileFrame>
      <div className="flex items-center gap-3">
        <Crown className="text-primary" />
        <h1 className="text-2xl font-bold">Upgrade your account</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Unlock withdrawals and higher earnings.</p>

      <div className="mt-6 space-y-4 mb-28">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-3xl border p-5 ${p.best ? "border-primary glow-soft bg-card/60" : "border-border bg-card/40"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{p.name}</div>
                <div className="text-3xl font-bold">₦{p.price.toLocaleString()}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
              </div>
              {p.best && <span className="rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold px-3 py-1">BEST VALUE</span>}
            </div>
            <ul className="mt-4 space-y-2">
              {p.perks.map((x) => (
                <li key={x} className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary" /> {x}</li>
              ))}
            </ul>
            <button onClick={() => toast("Payment integration coming soon")} className={`mt-5 w-full rounded-full font-bold py-3.5 ${p.best ? "bg-primary text-primary-foreground glow-primary" : "border border-primary/40 text-foreground"}`}>
              Choose {p.name}
            </button>
          </div>
        ))}
      </div>
    </MobileFrame>
  );
}
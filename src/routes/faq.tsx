import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — ETHERUM" }] }),
  component: FAQ,
});

const items = [
  { q: "How do I withdraw my balance?", a: "Upgrade your account to unlock bank withdrawals. Payouts arrive within minutes." },
  { q: "How are bonuses calculated?", a: "Welcome bonus is ₦50,000. Surprise drops range from ₦5,000–₦25,000." },
  { q: "Is ETHERUM secure?", a: "Yes — 256-bit SSL, PCI-DSS compliant, and all funds are held in the ETHERUM Secure Vault." },
  { q: "Can I refer friends?", a: "Yes — each successful referral earns you ₦2,000." },
];

function FAQ() {
  return (
    <MobileFrame>
      <header className="flex items-center gap-4">
        <Link to="/dashboard" className="grid place-items-center size-11 rounded-full bg-card border border-border"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold">FAQ</h1>
      </header>
      <div className="mt-6 space-y-3">
        {items.map((i) => (
          <details key={i.q} className="rounded-2xl border border-border bg-card/40 p-4 group">
            <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">{i.q}<span className="text-primary group-open:rotate-45 transition-transform">+</span></summary>
            <p className="mt-2 text-sm text-muted-foreground">{i.a}</p>
          </details>
        ))}
      </div>
    </MobileFrame>
  );
}
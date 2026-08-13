import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Copy } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { toast } from "sonner";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/withdrawal-approved")({
  head: () => ({ meta: [{ title: "Withdrawal Approved — ETHERUM" }] }),
  validateSearch: zodValidator(z.object({ id: fallback(z.string(), "").default("") })),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  const { data: w } = useQuery({
    queryKey: ["withdrawal-approved", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawals").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const code = w?.withdrawal_code ?? "FPC-PENDING";

  function copy() {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  }

  return (
    <MobileFrame>
      <div className="mt-6 grid place-items-center animate-fade-in">
        <div className="relative size-32 rounded-full grid place-items-center bg-primary/15 border-2 border-primary/50 glow-primary animate-scale-in">
          <CheckCircle2 size={72} className="text-primary" strokeWidth={2} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mt-6">Withdrawal Approved!</h2>
      <p className="text-center text-muted-foreground mt-2">Your withdrawal request has been approved.</p>

      <div className="mt-6 rounded-3xl border border-primary/40 bg-card/70 p-5 text-center glow-primary">
        <div className="text-xs tracking-widest text-muted-foreground">YOUR WITHDRAWAL CODE</div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="text-2xl font-bold font-mono text-primary tracking-wider">{code}</div>
          <button onClick={copy} className="grid place-items-center size-10 rounded-lg bg-primary/15 border border-primary/30 hover:bg-primary/25 transition">
            <Copy size={16} className="text-primary" />
          </button>
        </div>
      </div>

      <dl className="mt-4 rounded-3xl border border-border bg-card/40 divide-y divide-border">
        <Row k="Amount" v={formatNaira(Number(w?.amount ?? 0))} />
        <Row k="Bank" v={w?.bank_name || "—"} />
        <Row k="Approved" v={w?.approved_at ? new Date(w.approved_at).toLocaleString() : "—"} />
      </dl>

      <Link
        to="/dashboard"
        className="mt-6 mb-24 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 flex items-center justify-center glow-primary hover:scale-[1.02] transition"
      >
        Go to Dashboard →
      </Link>
    </MobileFrame>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-sm">{v}</dd>
    </div>
  );
}
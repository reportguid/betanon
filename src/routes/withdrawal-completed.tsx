import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { StatusBadge, WithdrawTimeline } from "@/components/etherum/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/withdrawal-completed")({
  head: () => ({ meta: [{ title: "Withdrawal Completed — ETHERUM" }] }),
  validateSearch: zodValidator(z.object({ id: fallback(z.string(), "").default("") })),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  const { data: w } = useQuery({
    queryKey: ["withdrawal-completed", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawals").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  return (
    <MobileFrame>
      <header className="flex items-center gap-3">
        <Link to="/dashboard" className="grid place-items-center size-10 rounded-full bg-card border border-border">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold">Withdrawal Status</h1>
      </header>

      <div className="mt-8 grid place-items-center animate-fade-in">
        <div className="size-28 rounded-full grid place-items-center bg-emerald-500/15 border-2 border-emerald-500/40 glow-primary animate-scale-in">
          <CheckCircle2 size={64} className="text-emerald-400" strokeWidth={2} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-center mt-6">Withdrawal Completed</h2>
      <p className="text-center text-muted-foreground mt-3 max-w-sm mx-auto">
        Funds have been sent to your bank account. Please allow a few minutes for it to reflect.
      </p>

      <div className="mt-6 flex justify-center">
        <StatusBadge status="completed" />
      </div>

      <dl className="mt-6 rounded-3xl border border-border bg-card/60 divide-y divide-border">
        <Row k="Amount" v={formatNaira(Number(w?.amount ?? 0))} />
        <Row k="Bank" v={w?.bank_name || "—"} />
        <Row k="Account" v={w?.account_number || "—"} mono />
        <Row k="Reference" v={String(w?.withdrawal_code || id || "—").toUpperCase()} mono />
        <Row k="Completed" v={w?.updated_at ? new Date(w.updated_at).toLocaleString() : "—"} />
      </dl>

      <div className="mt-4 rounded-3xl border border-border bg-card/40 p-4 mb-24">
        <div className="font-semibold">Progress</div>
        <WithdrawTimeline status="completed" />
      </div>
    </MobileFrame>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={`font-semibold text-sm ${mono ? "font-mono" : ""}`}>{v}</dd>
    </div>
  );
}
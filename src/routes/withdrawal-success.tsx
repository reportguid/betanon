import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { StatusBadge, WithdrawTimeline } from "@/components/etherox/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/withdrawal-success")({
  head: () => ({ meta: [{ title: "Request Submitted — BETANO" }] }),
  validateSearch: zodValidator(z.object({ id: fallback(z.string(), "").default("") })),
  component: Page,
});

function mask(acc?: string | null) {
  if (!acc) return "—";
  const t = String(acc).replace(/\s/g, "");
  return t.length <= 4 ? t : "••••••" + t.slice(-4);
}

function Page() {
  const { id } = Route.useSearch();
  const { data: w, isLoading } = useQuery({
    queryKey: ["withdrawal", id],
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
        <h1 className="text-lg font-bold">Payment Status</h1>
      </header>

      <div className="mt-6 grid place-items-center animate-fade-in">
        <div className="relative size-28 rounded-full grid place-items-center bg-primary/15 border border-primary/40 glow-primary animate-scale-in">
          <CheckCircle2 size={64} className="text-primary" strokeWidth={2} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mt-6">Request Submitted!</h2>
      <p className="text-center text-muted-foreground mt-2 max-w-sm mx-auto">
        Your withdrawal request has been received and is currently being processed.
      </p>

      <div className="mt-6 rounded-3xl border border-primary/25 bg-card/60 p-5 text-center glow-soft">
        <div className="text-xs tracking-widest text-muted-foreground">AMOUNT</div>
        <div className="text-4xl font-bold text-primary mt-2">
          {isLoading ? "—" : formatNaira(Number(w?.amount ?? 0))}
        </div>
        <div className="mt-3 flex justify-center">
          <StatusBadge status={(w?.status as any) ?? "processing"} extra="Usually within 24 hours" />
        </div>
      </div>

      <dl className="mt-4 rounded-3xl border border-border bg-card/40 divide-y divide-border">
        <Row k="Bank" v={w?.bank_name || "—"} />
        <Row k="Account" v={mask(w?.account_number)} mono />
        <Row k="Reference ID" v={String(w?.id ?? id).toUpperCase()} mono small />
        <Row k="Date & Time" v={w?.created_at ? new Date(w.created_at).toLocaleString() : "—"} />
      </dl>

      <WithdrawTimeline status={(w?.status as any) ?? "processing"} />

      <Link
        to="/dashboard"
        className="mt-8 mb-24 w-full rounded-full bg-primary text-primary-foreground font-bold py-4 flex items-center justify-center glow-primary hover:scale-[1.02] transition"
      >
        Go to Dashboard
      </Link>
    </MobileFrame>
  );
}

function Row({ k, v, mono, small }: { k: string; v: string; mono?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={`font-semibold ${mono ? "font-mono" : ""} ${small ? "text-xs" : "text-sm"}`}>{v}</dd>
    </div>
  );
}
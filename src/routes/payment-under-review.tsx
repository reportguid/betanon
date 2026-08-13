import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { StatusBadge } from "@/components/etherum/StatusBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, ArrowLeft, Info } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useEffect } from "react";

export const Route = createFileRoute("/payment-under-review")({
  head: () => ({ meta: [{ title: "Payment Under Review — ETHERUM" }] }),
  validateSearch: zodValidator(z.object({ id: fallback(z.string(), "").default("") })),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: d } = useQuery({
    queryKey: ["deposit", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("deposits").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  useEffect(() => {
    if (!id) return;
    // Auto-redirect if already resolved on first load
    if (d?.status === "approved") { nav({ to: "/payment-approved", search: { payment: id } }); return; }
    if (d?.status === "rejected") { nav({ to: "/payment-review", search: { id } }); return; }

    const channel = supabase
      .channel(`deposit-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deposits", filter: `id=eq.${id}` },
        (payload) => {
          const row: any = payload.new;
          qc.setQueryData(["deposit", id], row);
          if (row.status === "approved") nav({ to: "/payment-approved", search: { payment: id } });
          else if (row.status === "rejected") nav({ to: "/payment-review", search: { id } });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, d?.status, nav, qc]);

  return (
    <MobileFrame>
      <header className="flex items-center gap-3">
        <Link to="/dashboard" className="grid place-items-center size-10 rounded-full bg-card border border-border">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold">Payment Status</h1>
      </header>

      <div className="mt-8 grid place-items-center animate-fade-in">
        <div className="size-28 rounded-full grid place-items-center bg-yellow-500/15 border-2 border-yellow-500/40 animate-scale-in">
          <Clock size={60} className="text-yellow-400" strokeWidth={2} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-center mt-6">Payment Under Review</h2>
      <p className="text-center text-muted-foreground mt-3 max-w-sm mx-auto">
        Your payment receipt has been received and is currently being verified by our team.
        Your withdrawal code will be activated once payment is approved.
      </p>

      <dl className="mt-6 rounded-3xl border border-border bg-card/60 divide-y divide-border">
        <Row k="Amount Paid" v={formatNaira(Number(d?.amount ?? 0))} />
        <Row k="Payment Method" v={d?.method ? String(d.method).replace(/_/g, " ") : "—"} />
        <Row k="Receipt Number" v={String(d?.reference || id || "—").toUpperCase()} mono />
        <Row k="Date & Time" v={d?.created_at ? new Date(d.created_at).toLocaleString() : "—"} />
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">Status</dt>
          <dd>
            <StatusBadge status={((d?.status === "approved" ? "approved" : d?.status === "rejected" ? "rejected" : "processing")) as any} />
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-3xl border border-border bg-card/40 p-4 flex gap-3 mb-24">
        <div className="size-10 rounded-full grid place-items-center bg-primary/15 border border-primary/30 shrink-0">
          <Info size={16} className="text-primary" />
        </div>
        <div>
          <div className="font-semibold">Verification Notice</div>
          <p className="text-sm text-muted-foreground mt-1">
            Payment verification usually takes between 5 minutes and 24 hours depending on workload.
            This page will update automatically once your payment is approved.
          </p>
        </div>
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
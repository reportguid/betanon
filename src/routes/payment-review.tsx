import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/payment-review")({
  head: () => ({ meta: [{ title: "Payment Rejected — BETANO" }] }),
  validateSearch: zodValidator(z.object({ id: fallback(z.string(), "").default("") })),
  component: Page,
});

function Page() {
  const { id } = Route.useSearch();
  const { data } = useQuery({
    queryKey: ["rejected", id],
    enabled: !!id,
    queryFn: async () => {
      const [w, d] = await Promise.all([
        supabase.from("withdrawals").select("*").eq("id", id).maybeSingle(),
        supabase.from("deposits").select("*").eq("id", id).maybeSingle(),
      ]);
      return (w.data ?? d.data) as any;
    },
  });
  const reason = data?.rejection_reason || data?.admin_note;

  return (
    <MobileFrame>
      <div className="mt-24 grid place-items-center animate-fade-in">
        <div className="size-24 rounded-full grid place-items-center bg-red-500/15 border-2 border-red-500/40 animate-scale-in">
          <AlertCircle size={56} className="text-red-400" strokeWidth={2} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-center mt-6">Payment Rejected</h2>
      <p className="text-center text-muted-foreground mt-3 max-w-sm mx-auto">
        Your payment could not be verified. Please contact support for assistance.
      </p>
      {reason && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          <span className="font-semibold">Reason:</span> {reason}
        </div>
      )}
      <div className="mt-8 mb-24 grid grid-cols-2 gap-3">
        <Link to="/support" className="rounded-full border border-border bg-card py-4 text-center font-semibold hover:bg-card/70 transition">
          Contact Support
        </Link>
        <Link to="/dashboard" className="rounded-full bg-primary text-primary-foreground py-4 text-center font-bold glow-primary hover:scale-[1.02] transition">
          Dashboard
        </Link>
      </div>
    </MobileFrame>
  );
}
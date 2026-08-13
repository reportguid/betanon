import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/etherum/MobileFrame";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Copy, Share2, Sparkles, Wallet } from "lucide-react";
import { formatNaira } from "@/lib/wallet";
import { toast } from "sonner";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/payment-approved")({
  head: () => ({ meta: [{ title: "Payment Approved — ETHERUM" }] }),
  validateSearch: zodValidator(z.object({ payment: fallback(z.string(), "").default("") })),
  component: Page,
});

function Page() {
  const { payment } = Route.useSearch();
  const { data: d } = useQuery({
    queryKey: ["deposit-approved", payment],
    enabled: !!payment,
    queryFn: async () => {
      const { data, error } = await supabase.from("deposits").select("*").eq("id", payment).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const code = d?.fpc_code ?? "FPC-PENDING";

  function copy() {
    navigator.clipboard.writeText(code);
    toast.success("FPC code copied");
  }
  function share() {
    const text = `I just got approved on ETHERUM! My code: ${code}`;
    if (typeof navigator !== "undefined" && navigator.share) navigator.share({ text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast.success("Shared text copied"); }
  }

  return (
    <MobileFrame>
      <div className="mt-6 grid place-items-center animate-fade-in">
        <div className="size-32 rounded-full grid place-items-center bg-primary/15 border-2 border-primary/50 glow-primary animate-scale-in">
          <CheckCircle2 size={72} className="text-primary" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wider text-primary">
          <Sparkles size={14} /> PAYMENT APPROVED
        </span>
      </div>
      <h2 className="text-3xl font-bold text-center mt-4">Congratulations! 🎉</h2>
      <p className="text-center text-muted-foreground mt-2">
        Your payment of <span className="text-foreground font-semibold">{formatNaira(Number(d?.amount ?? 0))}</span> has been verified and approved by admin.
      </p>

      <div className="mt-6 rounded-3xl border border-primary/30 bg-card/60 p-5 glow-soft">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary">
          <Sparkles size={14} /> YOUR FPC CODE
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use this code on the withdrawal page to unlock and process your funds. Keep it safe — it can only be used once.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-background/60 border border-border py-3 px-4 text-center font-mono font-bold tracking-widest">
            {code}
          </div>
          <button onClick={copy} className="grid place-items-center size-12 rounded-xl bg-primary text-primary-foreground hover:scale-[1.05] transition">
            <Copy size={18} />
          </button>
        </div>
        <button onClick={copy} className="w-full mt-3 text-xs text-primary font-semibold">Tap to copy code</button>
      </div>

      <div className="mt-6 space-y-3 mb-24">
        <Link to="/withdraw" className="w-full rounded-full bg-primary text-primary-foreground font-bold py-4 flex items-center justify-center gap-2 glow-primary hover:scale-[1.02] transition">
          <Wallet size={18} /> Withdraw Now
        </Link>
        <button onClick={share} className="w-full rounded-full border border-primary/40 bg-card/40 py-4 flex items-center justify-center gap-2 font-semibold hover:bg-card/60 transition">
          <Share2 size={18} /> Share My Success
        </button>
      </div>
    </MobileFrame>
  );
}
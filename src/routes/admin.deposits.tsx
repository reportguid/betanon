import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { ReviewTable } from "@/components/admin/ReviewTable";
import { reviewRequest } from "@/lib/adminReview";
import { enrichWithProfiles } from "@/lib/enrichProfiles";
import { formatNaira } from "@/lib/wallet";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/deposits")({ component: Deposits });

function Deposits() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-deposits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deposits").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return await enrichWithProfiles((data ?? []) as any[]);
    },
  });

  async function handle(id: string, status: "approved" | "rejected") {
    try { await reviewRequest("deposits", id, status); toast.success(`Deposit ${status}`); qc.invalidateQueries({ queryKey: ["admin-deposits"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <PageHeader title="Deposits" subtitle="Approve or reject user deposit requests" />
      <ReviewTable
        loading={isLoading}
        columns={["User", "Amount", "Method", "Reference", "Date"]}
        rows={(data ?? []).map((d: any) => ({
          id: d.id, status: d.status,
          cells: [
            <div><div className="font-medium">{d.profile?.full_name || "—"}</div><div className="text-xs text-slate-500">{d.profile?.email}</div></div>,
            <span className="font-semibold">{formatNaira(Number(d.amount))}</span>,
            d.method,
            <span className="text-xs text-slate-400 font-mono">{d.reference || "—"}</span>,
            <span className="text-xs text-slate-400">{new Date(d.created_at).toLocaleString()}</span>,
          ],
        }))}
        onApprove={(id) => handle(id, "approved")}
        onReject={(id) => handle(id, "rejected")}
      />
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { ReviewTable } from "@/components/admin/ReviewTable";
import { reviewRequest } from "@/lib/adminReview";
import { enrichWithProfiles } from "@/lib/enrichProfiles";
import { formatNaira } from "@/lib/wallet";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/withdrawals")({ component: Withdrawals });

function Withdrawals() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return await enrichWithProfiles((data ?? []) as any[]);
    },
  });

  async function handle(id: string, status: "approved" | "rejected") {
    try { await reviewRequest("withdrawals", id, status); toast.success(`Withdrawal ${status}`); qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <PageHeader title="Withdrawals" subtitle="Approve or reject withdrawal requests" />
      <ReviewTable
        loading={isLoading}
        columns={["User", "Amount", "Bank", "Account", "Date"]}
        rows={(data ?? []).map((d: any) => ({
          id: d.id, status: d.status,
          cells: [
            <div><div className="font-medium">{d.profile?.full_name || "—"}</div><div className="text-xs text-slate-500">{d.profile?.email}</div></div>,
            <span className="font-semibold">{formatNaira(Number(d.amount))}</span>,
            d.bank_name || "—",
            <span className="text-xs font-mono">{d.account_number || "—"}</span>,
            <span className="text-xs text-slate-400">{new Date(d.created_at).toLocaleString()}</span>,
          ],
        }))}
        onApprove={(id) => handle(id, "approved")}
        onReject={(id) => handle(id, "rejected")}
      />
    </div>
  );
}
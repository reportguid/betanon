import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminLayout";
import { ReviewTable } from "@/components/admin/ReviewTable";
import { reviewRequest } from "@/lib/adminReview";
import { enrichWithProfiles } from "@/lib/enrichProfiles";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/kyc")({ component: Kyc });

function Kyc() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-kyc"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kyc_submissions").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return await enrichWithProfiles((data ?? []) as any[]);
    },
  });

  async function handle(id: string, status: "approved" | "rejected") {
    try { await reviewRequest("kyc_submissions", id, status); toast.success(`KYC ${status}`); qc.invalidateQueries({ queryKey: ["admin-kyc"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <PageHeader title="KYC Verification" subtitle="Review identity documents submitted by users" />
      <ReviewTable
        loading={isLoading}
        columns={["User", "Doc type", "Doc number", "Submitted"]}
        rows={(data ?? []).map((d: any) => ({
          id: d.id, status: d.status,
          cells: [
            <div><div className="font-medium">{d.profile?.full_name || "—"}</div><div className="text-xs text-slate-500">{d.profile?.email}</div></div>,
            <span className="capitalize">{d.doc_type}</span>,
            <span className="text-xs font-mono">{d.doc_number || "—"}</span>,
            <span className="text-xs text-slate-400">{new Date(d.created_at).toLocaleString()}</span>,
          ],
        }))}
        onApprove={(id) => handle(id, "approved")}
        onReject={(id) => handle(id, "rejected")}
      />
    </div>
  );
}
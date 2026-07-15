import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { enrichWithProfiles } from "@/lib/enrichProfiles";
import { formatNaira } from "@/lib/wallet";

export const Route = createFileRoute("/admin/transactions")({ component: Txns });

function Txns() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-txns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return await enrichWithProfiles((data ?? []) as any[]);
    },
  });

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Complete ledger of platform activity" />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {data?.map((t: any) => (
              <tr key={t.id} className="border-b border-slate-800/60">
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(t.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{t.profile?.email || "—"}</td>
                <td className="px-4 py-3 capitalize">{t.type}</td>
                <td className="px-4 py-3 font-semibold">{formatNaira(Number(t.amount))}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-400">{t.reference || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { formatNaira } from "@/lib/wallet";

export const Route = createFileRoute("/admin/referrals")({ component: Referrals });

function Referrals() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data: refs } = await supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(200);
      const rows = refs ?? [];
      const ids = Array.from(new Set(rows.flatMap((r: any) => [r.referrer_id, r.referee_id])));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, email").in("id", ids)
        : { data: [] as any[] };
      const emailMap = new Map((profs ?? []).map((p: any) => [p.id, p.email]));
      return rows.map((r: any) => ({ ...r, referrer_email: emailMap.get(r.referrer_id), referee_email: emailMap.get(r.referee_id) }));
    },
  });

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Track referral bonuses and network growth" />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Referrer</th>
              <th className="px-4 py-3">Referee</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bonus</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {data?.map((r: any) => (
              <tr key={r.id} className="border-b border-slate-800/60">
                <td className="px-4 py-3">{r.referrer_email || "—"}</td>
                <td className="px-4 py-3">{r.referee_email || "—"}</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
                <td className="px-4 py-3 font-semibold">{formatNaira(Number(r.bonus_amount ?? 0))}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {data && data.length === 0 && !isLoading && <tr><td colSpan={5} className="p-6 text-center text-slate-500">No referrals yet</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { formatNaira } from "@/lib/wallet";

export const Route = createFileRoute("/admin/analytics")({ component: Analytics });

function Analytics() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const [users, deps, wds, txns] = await Promise.all([
        supabase.from("profiles").select("created_at").gte("created_at", since),
        supabase.from("deposits").select("amount, created_at, status").gte("created_at", since),
        supabase.from("withdrawals").select("amount, created_at, status").gte("created_at", since),
        supabase.from("transactions").select("amount, type, created_at").gte("created_at", since),
      ]);
      const byDay: Record<string, { users: number; deps: number; wds: number }> = {};
      const key = (d: string) => new Date(d).toISOString().slice(0, 10);
      for (let i = 6; i >= 0; i--) {
        const k = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        byDay[k] = { users: 0, deps: 0, wds: 0 };
      }
      users.data?.forEach((u: any) => { const k = key(u.created_at); if (byDay[k]) byDay[k].users++; });
      deps.data?.forEach((d: any) => { if (d.status === "approved") { const k = key(d.created_at); if (byDay[k]) byDay[k].deps += Number(d.amount); } });
      wds.data?.forEach((d: any) => { if (d.status === "approved") { const k = key(d.created_at); if (byDay[k]) byDay[k].wds += Number(d.amount); } });
      return {
        totalDeps: (deps.data ?? []).filter((d: any) => d.status === "approved").reduce((s: number, r: any) => s + Number(r.amount), 0),
        totalWds: (wds.data ?? []).filter((d: any) => d.status === "approved").reduce((s: number, r: any) => s + Number(r.amount), 0),
        newUsers: users.data?.length ?? 0,
        byDay,
      };
    },
  });

  const days = data ? Object.entries(data.byDay) : [];
  const max = Math.max(1, ...days.map(([, v]) => Math.max(v.deps, v.wds)));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Last 7 days performance" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5"><div className="text-xs uppercase text-slate-400">New users</div><div className="mt-2 text-2xl font-bold">{data?.newUsers ?? 0}</div></Card>
        <Card className="p-5"><div className="text-xs uppercase text-slate-400">Deposits (approved)</div><div className="mt-2 text-2xl font-bold">{formatNaira(data?.totalDeps ?? 0)}</div></Card>
        <Card className="p-5"><div className="text-xs uppercase text-slate-400">Withdrawals (approved)</div><div className="mt-2 text-2xl font-bold">{formatNaira(data?.totalWds ?? 0)}</div></Card>
      </div>
      <Card className="p-5">
        <div className="text-sm font-semibold mb-4">Daily volume</div>
        <div className="grid grid-cols-7 gap-2 items-end h-52">
          {days.map(([day, v]) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div className="w-full flex gap-1 items-end h-40">
                <div className="flex-1 rounded-t bg-emerald-500/60" style={{ height: `${(v.deps / max) * 100}%` }} title={`Deposits: ${formatNaira(v.deps)}`} />
                <div className="flex-1 rounded-t bg-orange-500/60" style={{ height: `${(v.wds / max) * 100}%` }} title={`Withdrawals: ${formatNaira(v.wds)}`} />
              </div>
              <div className="text-[10px] text-slate-500">{day.slice(5)}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-emerald-500/60"/> Deposits</span>
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-orange-500/60"/> Withdrawals</span>
        </div>
      </Card>
    </div>
  );
}
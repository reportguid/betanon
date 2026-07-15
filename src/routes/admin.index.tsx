import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { Users, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Wallet, TrendingUp } from "lucide-react";
import { formatNaira } from "@/lib/wallet";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [users, pendingDeps, pendingWds, pendingKyc, deps, wds] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("kyc_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("deposits").select("amount").eq("status", "approved"),
        supabase.from("withdrawals").select("amount").eq("status", "approved"),
      ]);
      const totalDeposits = (deps.data ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
      const totalWithdrawals = (wds.data ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
      return {
        users: users.count ?? 0,
        pendingDeps: pendingDeps.count ?? 0,
        pendingWds: pendingWds.count ?? 0,
        pendingKyc: pendingKyc.count ?? 0,
        totalDeposits,
        totalWithdrawals,
      };
    },
  });

  const stats = [
    { label: "Total Users", value: data?.users ?? 0, icon: Users, color: "text-sky-300" },
    { label: "Pending Deposits", value: data?.pendingDeps ?? 0, icon: ArrowDownToLine, color: "text-amber-300" },
    { label: "Pending Withdrawals", value: data?.pendingWds ?? 0, icon: ArrowUpFromLine, color: "text-orange-300" },
    { label: "Pending KYC", value: data?.pendingKyc ?? 0, icon: ShieldCheck, color: "text-violet-300" },
    { label: "Total Deposited", value: formatNaira(data?.totalDeposits ?? 0), icon: Wallet, color: "text-emerald-300" },
    { label: "Total Withdrawn", value: formatNaira(data?.totalWithdrawals ?? 0), icon: TrendingUp, color: "text-red-300" },
  ];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Real-time snapshot of platform activity" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400">{s.label}</span>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="mt-3 text-2xl font-bold">{isLoading ? "…" : s.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
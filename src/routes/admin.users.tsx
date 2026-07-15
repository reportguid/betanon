import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, StatusBadge } from "@/components/admin/AdminLayout";
import { formatNaira } from "@/lib/wallet";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  async function toggleBan(id: string, is_banned: boolean) {
    const { error } = await supabase.from("profiles").update({ is_banned: !is_banned }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(is_banned ? "User unbanned" : "User banned");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  async function adjustBalance(id: string, current: number) {
    const raw = prompt("Set new balance (NGN):", String(current));
    if (raw == null) return;
    const val = Number(raw);
    if (isNaN(val)) return toast.error("Invalid amount");
    const { error } = await supabase.from("profiles").update({ balance: val }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Balance updated");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage user accounts, balances and access" />
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email or name…" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading…</td></tr>}
            {data?.map((u: any) => (
              <tr key={u.id} className="border-b border-slate-800/60">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.full_name || "—"}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold">{formatNaira(Number(u.balance))}</td>
                <td className="px-4 py-3"><StatusBadge status={u.kyc_status} /></td>
                <td className="px-4 py-3">{u.is_banned ? <StatusBadge status="rejected" /> : <StatusBadge status="approved" />}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => adjustBalance(u.id, u.balance)} className="text-xs rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800">Balance</button>
                  <button onClick={() => toggleBan(u.id, u.is_banned)} className={`text-xs rounded-md px-2 py-1 inline-flex items-center gap-1 ${u.is_banned ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-red-500/15 text-red-300 border border-red-500/30"}`}>
                    {u.is_banned ? <><CheckCircle2 size={12}/> Unban</> : <><Ban size={12}/> Ban</>}
                  </button>
                </td>
              </tr>
            ))}
            {data && data.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
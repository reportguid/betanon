import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      return data ?? [];
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s: any) => {
        const v = s.value;
        map[s.key] = typeof v === "string" ? v : (v == null ? "" : JSON.stringify(v));
      });
      setValues(map);
    }
  }, [data]);

  const defaults = [
    { key: "site_name", label: "Site Name" },
    { key: "welcome_bonus", label: "Welcome Bonus (NGN)" },
    { key: "min_withdrawal", label: "Min Withdrawal (NGN)" },
    { key: "token_price", label: "Token Price (NGN)" },
    { key: "support_email", label: "Support Email" },
    { key: "support_phone", label: "Support Phone" },
  ];

  async function save(key: string) {
    const value = values[key] ?? "";
    const { error } = await supabase.from("site_settings").upsert({ key, value: value as any }, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
  }

  return (
    <div>
      <PageHeader title="Site Settings" subtitle="Global configuration for the platform" />
      <div className="grid gap-4 md:grid-cols-2">
        {defaults.map((f) => (
          <Card key={f.key} className="p-4">
            <label className="text-xs uppercase tracking-widest text-slate-400">{f.label}</label>
            <div className="mt-2 flex gap-2">
              <input value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
              <button onClick={() => save(f.key)} className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-2 text-sm">Save</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
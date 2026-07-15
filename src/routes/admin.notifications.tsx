import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({ component: Notifs });

function Notifs() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-notifs"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("is_broadcast", true).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  async function send() {
    if (!title || !body) return toast.error("Title & body required");
    const { error } = await supabase.from("notifications").insert({ title, body, is_broadcast: true });
    if (error) return toast.error(error.message);
    setTitle(""); setBody("");
    toast.success("Broadcast sent");
    qc.invalidateQueries({ queryKey: ["admin-notifs"] });
  }

  async function remove(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-notifs"] });
  }

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Broadcast announcements to all users" />
      <Card className="p-5 mb-4 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body" rows={3} className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
        <button onClick={send} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-sm">
          <Send size={14}/> Send broadcast
        </button>
      </Card>
      <Card>
        <div className="p-4 border-b border-slate-800 text-sm font-semibold">Recent broadcasts</div>
        <div className="divide-y divide-slate-800/60">
          {data?.map((n: any) => (
            <div key={n.id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-slate-400">{n.body}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => remove(n.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
          ))}
          {data && data.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">No broadcasts yet</div>}
        </div>
      </Card>
    </div>
  );
}
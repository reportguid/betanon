import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/banners")({ component: Banners });

function Banners() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await supabase.from("banners").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function create() {
    if (!title) return toast.error("Title required");
    const { error } = await supabase.from("banners").insert({ title, link_url: link || null, image_url: image || null, is_active: true });
    if (error) return toast.error(error.message);
    setTitle(""); setLink(""); setImage("");
    toast.success("Banner added");
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("banners").update({ is_active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }
  async function remove(id: string) {
    await supabase.from("banners").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  return (
    <div>
      <PageHeader title="Banners" subtitle="Promotional banners displayed to users" />
      <Card className="p-5 mb-4 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Banner title" className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link URL (optional)" className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL (optional)" className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
        <button onClick={create} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 text-sm"><Plus size={14}/> Add banner</button>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((b: any) => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{b.title}</div>
                {b.link_url && <div className="text-xs text-slate-500 mt-1 truncate">{b.link_url}</div>}
              </div>
              <button onClick={() => remove(b.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/40 text-slate-400"}`}>{b.is_active ? "Active" : "Inactive"}</span>
              <button onClick={() => toggle(b.id, b.is_active)} className="text-xs rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800">Toggle</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
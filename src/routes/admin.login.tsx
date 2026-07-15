import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Etherox" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (role) nav({ to: "/admin" });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      return toast.error(error?.message ?? "Sign in failed");
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setLoading(false);
    if (!role) {
      await supabase.auth.signOut();
      return toast.error("This account is not an admin.");
    }
    toast.success("Welcome, admin");
    nav({ to: "/admin" });
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-slate-400">Secure sign in</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs text-slate-400">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
              <Mail size={16} className="text-slate-500" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" placeholder="admin@etherox.com" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5">
              <Lock size={16} className="text-slate-500" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" placeholder="••••••••" />
            </div>
          </label>
        </div>
        <button disabled={loading} className="mt-6 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-semibold py-2.5 text-sm">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Sign In
        </button>
        <p className="mt-4 text-[11px] text-slate-500 text-center">Only accounts with the admin role can enter.</p>
      </form>
    </div>
  );
}
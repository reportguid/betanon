import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  ShieldCheck,
  Bell,
  UserPlus,
  Settings,
  Image as ImageIcon,
  BarChart3,
  LogOut,
  ShieldAlert,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
  { to: "/admin/kyc", label: "KYC", icon: ShieldCheck },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/referrals", label: "Referrals", icon: UserPlus },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout() {
  const { loading, user, isAdmin } = useAdminAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginRoute) return;
    if (!loading && !user) nav({ to: "/admin/login" });
  }, [loading, user, nav, isLoginRoute]);

  if (isLoginRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Outlet />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-200">
        <div className="text-sm opacity-70">Loading admin…</div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md text-center rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
          <ShieldAlert className="mx-auto text-red-400" size={40} />
          <h1 className="mt-4 text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your account does not have admin privileges.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              nav({ to: "/admin/login" });
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-xs uppercase tracking-widest text-slate-500">Etherox</div>
          <div className="text-lg font-bold">Admin Panel</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="text-xs text-slate-500 mb-2 px-1">{user.email}</div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              nav({ to: "/admin/login" });
            }}
            className="w-full flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="font-bold">Admin</div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              nav({ to: "/admin/login" });
            }}
            className="text-xs text-slate-400"
          >
            Sign out
          </button>
        </header>
        <nav className="md:hidden flex overflow-x-auto gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/40">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs border ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "border-slate-700 text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/40 ${className}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    verified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    rejected: "bg-red-500/15 text-red-300 border-red-500/30",
    failed: "bg-red-500/15 text-red-300 border-red-500/30",
    unverified: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };
  const cls = map[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}
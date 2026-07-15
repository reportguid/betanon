import { Link, useRouterState } from "@tanstack/react-router";
import { HomeIcon, ClockIcon, TrendingUpIcon, CircleCheckBigIcon, UserRoundIcon } from "lucide-react";

const tabs = [
  { to: "/dashboard", label: "Home", Icon: HomeIcon },
  { to: "/history", label: "History", Icon: ClockIcon },
  { to: "/upgrade", label: "Upgrade", Icon: TrendingUpIcon },
  { to: "/tasks", label: "Tasks", Icon: CircleCheckBigIcon },
  { to: "/profile", label: "Profile", Icon: UserRoundIcon },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const visibleOn = ["/dashboard", "/history", "/upgrade", "/tasks", "/profile", "/buy-token", "/pay-transfer"];
  if (!visibleOn.includes(pathname)) return null;
  return (
    <nav
      style={{ transition: "none", animation: "none", transform: "translateX(-50%)" }}
      className="fixed bottom-0 left-1/2 w-full max-w-md bg-[oklch(0.08_0.02_160)]/90 backdrop-blur-xl border-t border-primary/15 z-50"
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                style={{ animation: "none" }}
                className={`flex flex-col items-center gap-1.5 py-3 text-[11px] font-medium tracking-wide transition-colors duration-300 ${active ? "text-primary" : "text-white/60 hover:text-white/85"}`}
              >
                <Icon
                  size={24}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={active ? "ex-nav-active-glow" : ""}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
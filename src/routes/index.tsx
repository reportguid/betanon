import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/etherox/Logo";
import { MobileFrame } from "@/components/etherox/MobileFrame";
import { ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Etherox — Money moves, made simple" },
      { name: "description", content: "Earn online with daily tasks & referrals, then withdraw straight to any bank — all in one secure Etherox account." },
      { property: "og:title", content: "Etherox — Money moves, made simple" },
      { property: "og:description", content: "Earn online with daily tasks & referrals, then withdraw straight to any bank — all in one secure Etherox account." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <MobileFrame>
      <header className="flex items-center justify-between">
        <Brand size={36} />
        <Link to="/signin" className="text-sm text-foreground/90 hover:text-primary">Sign in</Link>
      </header>

      <div className="mt-14 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-1.5 text-xs">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          Trusted by 50,000+ Nigerians
        </span>

        <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight">
          Money moves,{" "}
          <span className="text-primary text-glow">made simple.</span>
        </h1>

        <p className="mt-6 text-muted-foreground leading-relaxed">
          Earn online with daily tasks & referrals, then withdraw straight to any bank — all in one secure Etherox account.
        </p>

        <Link
          to="/signup"
          className="mt-10 w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 flex items-center justify-center gap-2 glow-primary"
        >
          Get Started Free <ArrowRight size={18} />
        </Link>
        <Link
          to="/signin"
          className="mt-3 w-full rounded-2xl border border-primary/40 bg-card py-4 text-center font-semibold glow-soft"
        >
          I already have an account
        </Link>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[
            { Icon: Shield, label: "Bank-grade security" },
            { Icon: Zap, label: "Instant transfers" },
            { Icon: TrendingUp, label: "Earn rewards" },
          ].map(({ Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3.5 py-2 text-xs">
              <Icon size={14} className="text-primary" /> {label}
            </span>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}

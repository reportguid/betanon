import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full text-foreground">
      <div className="mx-auto w-full max-w-md min-h-screen px-5 pb-10 pt-6 relative">
        <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-primary/10 blur-3xl ex-float" />
        <div className="pointer-events-none absolute top-1/3 -right-24 size-80 rounded-full bg-primary/10 blur-3xl ex-float ex-delay-3" />
        <div className="relative ex-fade-up">{children}</div>
      </div>
    </div>
  );
}
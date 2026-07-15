export function BalanceSkeleton() {
  return (
    <div className="mt-6 rounded-3xl border border-primary/20 bg-card/60 p-5">
      <div className="ex-skeleton h-3 w-32" />
      <div className="ex-skeleton h-10 w-48 mt-4" />
      <div className="mt-5 flex items-center justify-between">
        <div className="ex-skeleton h-3 w-24" />
        <div className="ex-skeleton h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function TileSkeleton() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-card/40 px-4 py-4 flex items-center gap-3">
      <div className="ex-skeleton size-9 rounded-xl" />
      <div className="ex-skeleton h-3 flex-1" />
    </div>
  );
}

export function TxnRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      <div className="ex-skeleton size-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="ex-skeleton h-3 w-2/3" />
        <div className="ex-skeleton h-2 w-1/3" />
      </div>
      <div className="ex-skeleton h-4 w-16" />
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-background/30 px-5 py-8 text-center flex flex-col items-center gap-3">
      {icon && (
        <div className="grid place-items-center size-12 rounded-2xl bg-primary/10 border border-primary/25 text-primary">
          {icon}
        </div>
      )}
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{message}</div>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went sideways",
  message = "We couldn't load this right now. Give it another shot.",
  onRetry,
  icon,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-6 text-center flex flex-col items-center gap-3">
      {icon && <div className="grid place-items-center size-12 rounded-2xl bg-destructive/10 text-destructive">{icon}</div>}
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{message}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="rounded-full bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 glow-soft">
          Try again
        </button>
      )}
    </div>
  );
}
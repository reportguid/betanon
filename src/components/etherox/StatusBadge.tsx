import { cn } from "@/lib/utils";

export type WithdrawStatus = "pending" | "processing" | "approved" | "rejected" | "completed";

const map: Record<WithdrawStatus, { label: string; cls: string; dot: string }> = {
  pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-400" },
  processing: { label: "Processing", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
  approved: { label: "Approved", cls: "bg-green-500/15 text-green-400 border-green-500/30", dot: "bg-green-400" },
  rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border-red-500/30", dot: "bg-red-400" },
  completed: { label: "Completed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
};

export function StatusBadge({ status, extra }: { status: WithdrawStatus; extra?: string }) {
  const m = map[status] ?? map.pending;
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", m.cls)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
      {extra && <span className="text-muted-foreground font-normal">· {extra}</span>}
    </span>
  );
}

const steps: { key: string; label: string; matchStatuses: WithdrawStatus[] }[] = [
  { key: "s1", label: "Request Submitted", matchStatuses: ["pending", "processing", "approved", "completed"] },
  { key: "s2", label: "Under Review", matchStatuses: ["processing", "approved", "completed"] },
  { key: "s3", label: "Processing", matchStatuses: ["processing", "approved", "completed"] },
  { key: "s4", label: "Approved", matchStatuses: ["approved", "completed"] },
  { key: "s5", label: "Funds Sent", matchStatuses: ["completed"] },
  { key: "s6", label: "Completed", matchStatuses: ["completed"] },
];

export function WithdrawTimeline({ status }: { status: WithdrawStatus }) {
  return (
    <ol className="mt-6 space-y-3">
      {steps.map((s) => {
        const done = s.matchStatuses.includes(status);
        return (
          <li key={s.key} className="flex items-center gap-3">
            <span
              className={cn(
                "grid place-items-center size-7 rounded-full border text-[11px] font-bold transition",
                done ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
              )}
            >
              {done ? "✓" : "·"}
            </span>
            <span className={cn("text-sm", done ? "text-foreground font-medium" : "text-muted-foreground")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
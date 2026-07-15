import { ReactNode } from "react";
import { Card, StatusBadge } from "./AdminLayout";
import { CheckCircle2, XCircle } from "lucide-react";

export function ReviewTable({
  columns,
  rows,
  loading,
  onApprove,
  onReject,
  emptyLabel = "Nothing pending",
}: {
  columns: string[];
  rows: Array<{ id: string; status: string; cells: ReactNode[] }>;
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  emptyLabel?: string;
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-800">
          <tr>
            {columns.map((c) => <th key={c} className="px-4 py-3">{c}</th>)}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={columns.length + 2} className="p-6 text-center text-slate-500">Loading…</td></tr>}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={columns.length + 2} className="p-6 text-center text-slate-500">{emptyLabel}</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-800/60">
              {r.cells.map((c, i) => <td key={i} className="px-4 py-3">{c}</td>)}
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-right space-x-2">
                {r.status === "pending" && onApprove && (
                  <button onClick={() => onApprove(r.id)} className="text-xs inline-flex items-center gap-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1">
                    <CheckCircle2 size={12}/> Approve
                  </button>
                )}
                {r.status === "pending" && onReject && (
                  <button onClick={() => onReject(r.id)} className="text-xs inline-flex items-center gap-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 px-2 py-1">
                    <XCircle size={12}/> Reject
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
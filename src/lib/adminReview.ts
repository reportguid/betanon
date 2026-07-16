import { supabase } from "@/integrations/supabase/client";

function makeCode(prefix: string) {
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `${prefix}-${rand}`;
}

export async function reviewRequest(
  table: "deposits" | "withdrawals" | "kyc_submissions",
  id: string,
  status: "approved" | "rejected",
  note?: string,
) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  const { data: rowData, error: rowErr } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (rowErr || !rowData) throw rowErr ?? new Error("Not found");
  const row = rowData as any;

  const now = new Date().toISOString();
  const patch: any = {
    status,
    admin_note: note ?? null,
    reviewed_by: uid,
    reviewed_at: now,
  };
  if (status === "approved") {
    patch.approved_at = now;
    if (table === "withdrawals") patch.withdrawal_code = makeCode("FPC");
    if (table === "deposits") patch.fpc_code = makeCode("FPC");
  } else if (status === "rejected") {
    patch.rejected_at = now;
    patch.rejection_reason = note ?? null;
  }
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw error;

  if (status === "approved") {
    if (table === "deposits") {
      const { data: prof } = await supabase.from("profiles").select("balance").eq("id", row.user_id).maybeSingle();
      const newBal = Number(prof?.balance ?? 0) + Number(row.amount);
      await supabase.from("profiles").update({ balance: newBal }).eq("id", row.user_id);
      await supabase.from("transactions").insert({ user_id: row.user_id, type: "deposit", amount: row.amount, reference: row.id });
    } else if (table === "withdrawals") {
      const { data: prof } = await supabase.from("profiles").select("balance").eq("id", row.user_id).maybeSingle();
      const newBal = Math.max(0, Number(prof?.balance ?? 0) - Number(row.amount));
      await supabase.from("profiles").update({ balance: newBal }).eq("id", row.user_id);
      await supabase.from("transactions").insert({ user_id: row.user_id, type: "withdrawal", amount: row.amount, reference: row.id });
    } else if (table === "kyc_submissions") {
      await supabase.from("profiles").update({ kyc_status: "verified" }).eq("id", row.user_id);
    }
  } else if (status === "rejected" && table === "kyc_submissions") {
    await supabase.from("profiles").update({ kyc_status: "rejected" }).eq("id", row.user_id);
  }
}
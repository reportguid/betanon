import { supabase } from "@/integrations/supabase/client";

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

  const { error } = await supabase
    .from(table)
    .update({ status, admin_note: note ?? null, reviewed_by: uid, reviewed_at: new Date().toISOString() })
    .eq("id", id);
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
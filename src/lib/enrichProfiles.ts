import { supabase } from "@/integrations/supabase/client";

export async function enrichWithProfiles<T extends { user_id: string }>(rows: T[]): Promise<Array<T & { profile?: { email: string | null; full_name: string | null } }>> {
  if (!rows.length) return [];
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data } = await supabase.from("profiles").select("id, email, full_name").in("id", ids);
  const map = new Map((data ?? []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name }]));
  return rows.map((r) => ({ ...r, profile: map.get(r.user_id) }));
}
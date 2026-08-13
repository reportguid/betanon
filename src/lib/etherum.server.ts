import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Admin = SupabaseClient<Database>;

export const DEFAULT_SETTINGS = {
  app_name: "ETHERUM",
  promotional_reward_amount: 30000,
  verified_referrals_required: 17,
  membership_price: 15000,
  membership_duration_days: 365,
};

export async function loadSettings(client: Admin) {
  const { data } = await client.from("application_settings").select("key, value");
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) out[row.key] = row.value;
  return out as typeof DEFAULT_SETTINGS;
}

export async function writeAudit(
  client: Admin,
  entry: {
    actor_id: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    before?: unknown;
    after?: unknown;
  },
) {
  await client.from("audit_logs").insert({
    actor_id: entry.actor_id,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id ?? null,
    before: (entry.before ?? null) as never,
    after: (entry.after ?? null) as never,
  });
}

export async function assertAdmin(userClient: Admin, userId: string) {
  const { data } = await userClient.rpc("is_admin", { _user_id: userId });
  if (!data) throw new Error("Forbidden: administrator access required");
}

export type Eligibility = {
  withdrawableBalance: number;
  lockedReward: number;
  rewardStatus: string;
  verifiedReferrals: number;
  pendingReferrals: number;
  rejectedReferrals: number;
  requiredReferrals: number;
  identityVerified: boolean;
  bankVerified: boolean;
  membershipActive: boolean;
  membershipExpiresAt: string | null;
  banned: boolean;
  eligible: boolean;
  unmetRequirements: string[];
};

export async function computeEligibility(client: Admin, userId: string): Promise<Eligibility> {
  const settings = await loadSettings(client);
  const required = Number(settings.verified_referrals_required ?? 17);

  const [{ data: profile }, { data: reward }, { data: referrals }, { data: bank }] =
    await Promise.all([
      client
        .from("profiles")
        .select("balance, kyc_status, is_banned, membership_status, membership_expires_at, bank_verified")
        .eq("id", userId)
        .maybeSingle(),
      client.from("promotional_rewards").select("amount, status").eq("user_id", userId).maybeSingle(),
      client.from("referrals").select("status").eq("referrer_id", userId),
      client.from("bank_accounts").select("is_verified").eq("user_id", userId).eq("is_verified", true).limit(1),
    ]);

  const counts = { verified: 0, pending: 0, rejected: 0 };
  for (const r of referrals ?? []) {
    if (r.status === "verified" || r.status === "approved") counts.verified += 1;
    else if (r.status === "rejected") counts.rejected += 1;
    else counts.pending += 1;
  }

  const identityVerified = profile?.kyc_status === "verified";
  const bankVerified = Boolean(profile?.bank_verified) || (bank?.length ?? 0) > 0;
  const membershipActive =
    profile?.membership_status === "active" &&
    (!profile?.membership_expires_at || new Date(profile.membership_expires_at) > new Date());
  const withdrawableBalance = Number(profile?.balance ?? 0);
  const rewardStatus = reward?.status ?? "locked";
  const banned = Boolean(profile?.is_banned);

  const unmet: string[] = [];
  if (banned) unmet.push("This account is suspended. Contact support.");
  if (counts.verified < required)
    unmet.push(`${required} verified referrals required — you have ${counts.verified}.`);
  if (!identityVerified) unmet.push("Identity verification is not complete.");
  if (!bankVerified) unmet.push("Bank account is not verified.");
  if (!membershipActive) unmet.push("ETHERUM Premium Membership is not active.");
  if (withdrawableBalance <= 0) unmet.push("No approved withdrawable balance yet.");

  return {
    withdrawableBalance,
    lockedReward: Number(reward?.amount ?? settings.promotional_reward_amount ?? 30000),
    rewardStatus,
    verifiedReferrals: counts.verified,
    pendingReferrals: counts.pending,
    rejectedReferrals: counts.rejected,
    requiredReferrals: required,
    identityVerified,
    bankVerified,
    membershipActive,
    membershipExpiresAt: profile?.membership_expires_at ?? null,
    banned,
    eligible: unmet.length === 0,
    unmetRequirements: unmet,
  };
}
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Secure, server-computed withdrawal eligibility for the signed-in member. */
export const getWithdrawalEligibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { computeEligibility } = await import("./etherum.server");
    return computeEligibility(context.supabase as never, context.userId);
  });

/** Referral summary — permanent code, counts and history. */
export const getReferralSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadSettings } = await import("./etherum.server");
    const supabase = context.supabase;
    const settings = await loadSettings(supabase as never);
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: rows } = await supabase
      .from("referrals")
      .select("id, status, created_at, verified_at, rejection_reason, referee_id")
      .eq("referrer_id", context.userId)
      .order("created_at", { ascending: false });
    const list = rows ?? [];
    const verified = list.filter((r) => r.status === "verified" || r.status === "approved").length;
    const { data: reward } = await supabase
      .from("promotional_rewards")
      .select("amount, status")
      .eq("user_id", context.userId)
      .maybeSingle();
    return {
      referralCode: profile?.referral_code ?? null,
      required: Number(settings.verified_referrals_required ?? 17),
      verified,
      pending: list.filter((r) => r.status === "pending").length,
      rejected: list.filter((r) => r.status === "rejected").length,
      rewardAmount: Number(reward?.amount ?? settings.promotional_reward_amount ?? 30000),
      rewardStatus: reward?.status ?? "locked",
      history: list,
    };
  });

/** Submit a withdrawal — eligibility is decided on the server, never in the browser. */
export const submitWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amount: number; bankAccountId?: string }) => {
    const amount = Number(input?.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
    return { amount, bankAccountId: input?.bankAccountId };
  })
  .handler(async ({ data, context }) => {
    const { computeEligibility, writeAudit } = await import("./etherum.server");
    const supabase = context.supabase;
    const eligibility = await computeEligibility(supabase as never, context.userId);
    if (!eligibility.eligible) {
      return { ok: false as const, reasons: eligibility.unmetRequirements };
    }
    if (data.amount > eligibility.withdrawableBalance) {
      return { ok: false as const, reasons: ["Amount exceeds your approved withdrawable balance."] };
    }
    const { data: bank } = await supabase
      .from("bank_accounts")
      .select("bank_name, account_number, account_name")
      .eq("user_id", context.userId)
      .eq("is_verified", true)
      .limit(1)
      .maybeSingle();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: context.userId,
        amount: data.amount,
        bank_name: bank?.bank_name ?? "",
        account_number: bank?.account_number ?? "",
        account_name: bank?.account_name ?? "",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: "withdrawal.submitted",
      entity_type: "withdrawals",
      entity_id: row.id,
      after: { amount: data.amount },
    });
    return { ok: true as const, id: row.id };
  });

/** Admin: verify or reject a referral. */
export const reviewReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "verified" | "rejected"; reason?: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: before } = await supabaseAdmin.from("referrals").select("*").eq("id", data.id).maybeSingle();
    const { error } = await supabaseAdmin
      .from("referrals")
      .update({
        status: data.status,
        verified_by: context.userId,
        verified_at: data.status === "verified" ? new Date().toISOString() : null,
        rejection_reason: data.status === "rejected" ? (data.reason ?? null) : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: `referral.${data.status}`,
      entity_type: "referrals",
      entity_id: data.id,
      before,
      after: { status: data.status, reason: data.reason ?? null },
    });
    return { ok: true };
  });

/** Admin: approve or reject a member's locked promotional reward. */
export const reviewPromotionalReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "approved" | "rejected" | "under_review"; note?: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit, computeEligibility } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: before } = await supabaseAdmin
      .from("promotional_rewards")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!before) throw new Error("Reward not found");

    if (data.status === "approved") {
      const elig = await computeEligibility(supabaseAdmin as never, before.user_id);
      if (elig.verifiedReferrals < elig.requiredReferrals) {
        return { ok: false as const, reason: `Member has ${elig.verifiedReferrals}/${elig.requiredReferrals} verified referrals.` };
      }
      const { data: prof } = await supabaseAdmin.from("profiles").select("balance").eq("id", before.user_id).maybeSingle();
      await supabaseAdmin
        .from("profiles")
        .update({ balance: Number(prof?.balance ?? 0) + Number(before.amount) })
        .eq("id", before.user_id);
      await supabaseAdmin.from("transactions").insert({
        user_id: before.user_id,
        type: "promotional_reward",
        amount: before.amount,
        reference: before.id,
      });
    }

    await supabaseAdmin
      .from("promotional_rewards")
      .update({
        status: data.status,
        admin_note: data.note ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: `promotional_reward.${data.status}`,
      entity_type: "promotional_rewards",
      entity_id: data.id,
      before,
      after: { status: data.status, note: data.note ?? null },
    });
    return { ok: true as const };
  });

/** Admin: verify or reject an ETHERUM Premium Membership payment. */
export const reviewMembershipPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "approved" | "rejected"; note?: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit, loadSettings } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: before } = await supabaseAdmin
      .from("membership_payments")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!before) throw new Error("Payment not found");

    const now = new Date();
    let expires: string | null = null;
    if (data.status === "approved") {
      const settings = await loadSettings(supabaseAdmin as never);
      const days = Number(settings.membership_duration_days ?? 365);
      expires = new Date(now.getTime() + days * 86400000).toISOString();
      await supabaseAdmin
        .from("profiles")
        .update({ membership_status: "active", membership_expires_at: expires })
        .eq("id", before.user_id);
      await supabaseAdmin.from("transactions").insert({
        user_id: before.user_id,
        type: "membership",
        amount: before.amount,
        reference: before.id,
      });
    }

    await supabaseAdmin
      .from("membership_payments")
      .update({
        status: data.status,
        admin_note: data.note ?? null,
        reviewed_by: context.userId,
        reviewed_at: now.toISOString(),
        starts_at: data.status === "approved" ? now.toISOString() : null,
        expires_at: expires,
      })
      .eq("id", data.id);

    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: `membership_payment.${data.status}`,
      entity_type: "membership_payments",
      entity_id: data.id,
      before,
      after: { status: data.status, expires_at: expires },
    });
    return { ok: true as const };
  });

/** Admin: approve, reject or complete a withdrawal request. */
export const reviewWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "approved" | "rejected" | "completed"; note?: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: before } = await supabaseAdmin.from("withdrawals").select("*").eq("id", data.id).maybeSingle();
    if (!before) throw new Error("Withdrawal not found");
    const now = new Date().toISOString();

    if (data.status === "approved" && before.status !== "approved") {
      const { data: prof } = await supabaseAdmin.from("profiles").select("balance").eq("id", before.user_id).maybeSingle();
      const next = Number(prof?.balance ?? 0) - Number(before.amount);
      if (next < 0) return { ok: false as const, reason: "Member balance is insufficient." };
      await supabaseAdmin.from("profiles").update({ balance: next }).eq("id", before.user_id);
      await supabaseAdmin.from("transactions").insert({
        user_id: before.user_id,
        type: "withdrawal",
        amount: before.amount,
        reference: before.id,
      });
    }

    await supabaseAdmin
      .from("withdrawals")
      .update({
        status: data.status,
        admin_note: data.note ?? null,
        reviewed_by: context.userId,
        reviewed_at: now,
        approved_at: data.status === "approved" ? now : before.approved_at,
        rejected_at: data.status === "rejected" ? now : null,
        rejection_reason: data.status === "rejected" ? (data.note ?? null) : null,
      })
      .eq("id", data.id);

    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: `withdrawal.${data.status}`,
      entity_type: "withdrawals",
      entity_id: data.id,
      before,
      after: { status: data.status, note: data.note ?? null },
    });
    return { ok: true as const };
  });

/** Admin: ban or restore a member account. */
export const setAccountBanned = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; banned: boolean; reason?: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ is_banned: data.banned }).eq("id", data.userId);
    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: data.banned ? "account.banned" : "account.restored",
      entity_type: "profiles",
      entity_id: data.userId,
      after: { reason: data.reason ?? null },
    });
    return { ok: true };
  });

/** Admin: resolve a fraud flag. */
export const resolveFraudFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "cleared" | "confirmed"; note?: string }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("fraud_flags")
      .update({ status: data.status, resolved_by: context.userId, resolved_at: new Date().toISOString() })
      .eq("id", data.id);
    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: `fraud_flag.${data.status}`,
      entity_type: "fraud_flags",
      entity_id: data.id,
      after: { note: data.note ?? null },
    });
    return { ok: true };
  });

/** Admin: change an application setting. */
export const updateApplicationSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { key: string; value: unknown }) => input)
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("./etherum.server");
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: before } = await supabaseAdmin
      .from("application_settings")
      .select("*")
      .eq("key", data.key)
      .maybeSingle();
    await supabaseAdmin
      .from("application_settings")
      .upsert({ key: data.key, value: data.value as never, updated_by: context.userId, updated_at: new Date().toISOString() });
    await writeAudit(supabaseAdmin as never, {
      actor_id: context.userId,
      action: "settings.updated",
      entity_type: "application_settings",
      before,
      after: { key: data.key, value: data.value },
    });
    return { ok: true };
  });
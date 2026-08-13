
-- helper: admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

-- ---------------- application_settings ----------------
CREATE TABLE IF NOT EXISTS public.application_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.application_settings TO anon, authenticated;
GRANT ALL ON public.application_settings TO service_role;
ALTER TABLE public.application_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable by all" ON public.application_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.application_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
GRANT INSERT, UPDATE, DELETE ON public.application_settings TO authenticated;
INSERT INTO public.application_settings(key, value) VALUES
  ('app_name', '"ETHERUM"'::jsonb),
  ('promotional_reward_amount', '30000'::jsonb),
  ('verified_referrals_required', '17'::jsonb),
  ('membership_price', '15000'::jsonb),
  ('membership_duration_days', '365'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ---------------- profiles additions ----------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS membership_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS bank_verified boolean NOT NULL DEFAULT false;

-- ---------------- promotional_rewards ----------------
CREATE TABLE IF NOT EXISTS public.promotional_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  amount numeric NOT NULL DEFAULT 30000,
  status text NOT NULL DEFAULT 'locked',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotional_rewards TO authenticated;
GRANT ALL ON public.promotional_rewards TO service_role;
ALTER TABLE public.promotional_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reward" ON public.promotional_rewards FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read rewards" ON public.promotional_rewards FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins update rewards" ON public.promotional_rewards FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
GRANT UPDATE ON public.promotional_rewards TO authenticated;
CREATE TRIGGER promotional_rewards_touch BEFORE UPDATE ON public.promotional_rewards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------- membership_payments ----------------
CREATE TABLE IF NOT EXISTS public.membership_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 15000,
  method text NOT NULL DEFAULT 'bank_transfer',
  reference text,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending',
  starts_at timestamptz,
  expires_at timestamptz,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.membership_payments TO authenticated;
GRANT ALL ON public.membership_payments TO service_role;
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own membership payments" ON public.membership_payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "submit own membership payment" ON public.membership_payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "admins read membership payments" ON public.membership_payments FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins update membership payments" ON public.membership_payments FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
GRANT UPDATE ON public.membership_payments TO authenticated;
CREATE TRIGGER membership_payments_touch BEFORE UPDATE ON public.membership_payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------- bank_accounts ----------------
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  is_primary boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bank accounts" ON public.bank_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "add own bank account" ON public.bank_accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_verified = false);
CREATE POLICY "edit own unverified bank account" ON public.bank_accounts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_verified = false) WITH CHECK (user_id = auth.uid() AND is_verified = false);
CREATE POLICY "delete own unverified bank account" ON public.bank_accounts FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_verified = false);
CREATE POLICY "admins manage bank accounts" ON public.bank_accounts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER bank_accounts_touch BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------- fraud_flags ----------------
CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.fraud_flags TO authenticated;
GRANT ALL ON public.fraud_flags TO service_role;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage fraud flags" ON public.fraud_flags FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER fraud_flags_touch BEFORE UPDATE ON public.fraud_flags
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------- audit_logs ----------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs (created_at DESC);

-- ---------------- referrals additions ----------------
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE TRIGGER referrals_touch BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------- signup trigger: permanent code + reward + membership ----------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  ref_code text;
  referrer uuid;
BEGIN
  ref_code := 'ETH' || upper(substr(md5(NEW.id::text), 1, 5));

  SELECT id INTO referrer FROM public.profiles
   WHERE referral_code = upper(COALESCE(NEW.raw_user_meta_data->>'referral_code',''))
   LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    ref_code,
    referrer
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.promotional_rewards (user_id, amount, status)
  VALUES (NEW.id, 30000, 'locked')
  ON CONFLICT (user_id) DO NOTHING;

  IF referrer IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referee_id, status)
    VALUES (referrer, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$;

-- backfill locked rewards for existing members
INSERT INTO public.promotional_rewards (user_id, amount, status)
SELECT id, 30000, 'locked' FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

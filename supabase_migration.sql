-- ============================================================
-- PRECISION EDITORIAL — COMPLETE MIGRATION (v2)
-- Uruchom to w Supabase SQL Editor
-- Tworzy wszystko od zera: tabele + auth + RLS
-- ============================================================

-- ============================================================
-- 1. TABELE
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
                                             id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at      timestamptz DEFAULT now(),
    user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name            text NOT NULL,
    category        text NOT NULL DEFAULT 'Other',
    cost            numeric(10,2) NOT NULL,
    currency        text NOT NULL DEFAULT 'PLN',
    billing_cycle   text NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly')),
    next_billing_date date,
    status          text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled')),
    description     text,
    website         text,
    notes           text
    );

CREATE TABLE IF NOT EXISTS alerts (
                                      id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at       timestamptz DEFAULT now(),
    user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type             text NOT NULL
    CHECK (type IN ('renewal', 'budget', 'duplicate')),
    threshold_value  numeric(10,2) NOT NULL DEFAULT 0,
    threshold_unit   text NOT NULL DEFAULT 'days',
    enabled          boolean NOT NULL DEFAULT true,
    label            text NOT NULL,
    description      text
    );

CREATE TABLE IF NOT EXISTS profiles (
                                        id           uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at   timestamptz DEFAULT now(),
    email        text,
    display_name text,
    avatar_url   text
    );

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE POLICY "select_own_subscriptions" ON subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_subscriptions" ON subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_subscriptions" ON subscriptions
  FOR UPDATE TO authenticated
                        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_subscriptions" ON subscriptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Alerts
CREATE POLICY "select_own_alerts" ON alerts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_alerts" ON alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_alerts" ON alerts
  FOR UPDATE TO authenticated
                        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_alerts" ON alerts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- 3. TRIGGER — auto-tworzenie profilu przy rejestracji
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.profiles (id, email, display_name)
VALUES (
           NEW.id,
           NEW.email,
           split_part(NEW.email, '@', 1)
       )
    ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- GOTOWE.
-- Następny krok: Authentication → Providers → Email → Enable
-- ============================================================

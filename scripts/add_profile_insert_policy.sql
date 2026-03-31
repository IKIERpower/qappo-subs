-- ============================================================
-- Dodaj politykę INSERT dla tabeli profiles
-- (pozwala użytkownikom tworzyć swój własny profil)
-- Uruchom to w Supabase SQL Editor
-- ============================================================

-- 1. Polityka INSERT
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 2. Zaktualizuj trigger by czytał display_name z metadanych rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


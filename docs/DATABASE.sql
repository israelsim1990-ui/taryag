-- DATABASE.sql: Taryag Mitzvot Schema
-- Mission 01: Initial DB Setup
-- Executed on Supabase project: dxzlyjcklgsfhvkggfvs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS / PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

-- =====================
-- MITZVOT CATALOG (613 mitzvot)
-- =====================
CREATE TABLE IF NOT EXISTS public.mitzvot (
    id SERIAL PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    name_he TEXT NOT NULL,
    name_en TEXT,
    category TEXT,
    source TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

-- =====================
-- USER MITZVOT LOG (real-time fulfillment tracking)
-- =====================
CREATE TABLE IF NOT EXISTS public.mitzvot_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mitzvah_id INTEGER NOT NULL REFERENCES public.mitzvot(id),
    fulfilled_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_mitzvot_log_user_id ON public.mitzvot_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mitzvot_log_mitzvah_id ON public.mitzvot_log(mitzvah_id);
CREATE INDEX IF NOT EXISTS idx_mitzvot_log_fulfilled_at ON public.mitzvot_log(fulfilled_at DESC);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitzvot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitzvot_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "mitzvot_select" ON public.mitzvot FOR SELECT USING (true);
CREATE POLICY "log_select" ON public.mitzvot_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "log_insert" ON public.mitzvot_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "log_delete" ON public.mitzvot_log FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

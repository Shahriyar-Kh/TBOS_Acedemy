-- Migration: 20260930134313_content_cms_foundation.sql
-- Description: Foundation schema for Dynamic Content CMS (Courses, Specializations, Live Offers, Tutoring)

-- Helper function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.cms_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'Live online · One-to-one available · Group batches when scheduled',
  tagline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  curriculum JSONB NOT NULL DEFAULT '[]'::jsonb,
  audience TEXT NOT NULL DEFAULT '',
  prerequisites TEXT,
  price_note TEXT NOT NULL DEFAULT 'Affordable fee · Flexible monthly/one-time plan',
  icon TEXT NOT NULL DEFAULT 'Code2',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SPECIALIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.cms_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Specialization',
  tagline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Beginner to Advanced',
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  careers JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon TEXT NOT NULL DEFAULT 'Layers',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly_price NUMERIC(10,2),
  full_price NUMERIC(10,2),
  upfront_discount_enabled BOOLEAN NOT NULL DEFAULT false,
  upfront_discount_percent INTEGER NOT NULL DEFAULT 20,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. LIVE OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.cms_live_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  audience TEXT NOT NULL,
  age_or_education_level TEXT NOT NULL,
  duration TEXT NOT NULL,
  classes_per_week TEXT,
  session_duration TEXT,
  format TEXT NOT NULL DEFAULT 'Live Online Interactive Cohort',
  regular_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  offer_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PKR',
  billing_period TEXT NOT NULL DEFAULT 'month',
  free_demo BOOLEAN NOT NULL DEFAULT true,
  free_demo_note TEXT NOT NULL DEFAULT 'Free trial demo session available before enrollment',
  paid_note TEXT NOT NULL DEFAULT 'Full program is paid monthly at the group offer rate',
  schedule_note TEXT NOT NULL DEFAULT 'Contact admissions for next confirmed batch schedule',
  tagline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
  ideal_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TUTORING TABLE
CREATE TABLE IF NOT EXISTS public.cms_tutoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  summary TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT '',
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_options TEXT NOT NULL DEFAULT 'One-to-One Private Tuition & Small Custom Batches',
  pricing_notes TEXT NOT NULL DEFAULT 'Customized hourly or monthly packages available',
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance & lookups
CREATE INDEX IF NOT EXISTS idx_cms_courses_slug ON public.cms_courses(slug);
CREATE INDEX IF NOT EXISTS idx_cms_courses_published ON public.cms_courses(published);
CREATE INDEX IF NOT EXISTS idx_cms_courses_sort_order ON public.cms_courses(sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_specializations_slug ON public.cms_specializations(slug);
CREATE INDEX IF NOT EXISTS idx_cms_specializations_published ON public.cms_specializations(published);
CREATE INDEX IF NOT EXISTS idx_cms_specializations_sort_order ON public.cms_specializations(sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_live_offers_slug ON public.cms_live_offers(slug);
CREATE INDEX IF NOT EXISTS idx_cms_live_offers_published ON public.cms_live_offers(published);
CREATE INDEX IF NOT EXISTS idx_cms_live_offers_sort_order ON public.cms_live_offers(sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_tutoring_slug ON public.cms_tutoring(slug);
CREATE INDEX IF NOT EXISTS idx_cms_tutoring_published ON public.cms_tutoring(published);
CREATE INDEX IF NOT EXISTS idx_cms_tutoring_sort_order ON public.cms_tutoring(sort_order);

-- Automatic updated_at Triggers
DROP TRIGGER IF EXISTS trigger_cms_courses_updated_at ON public.cms_courses;
CREATE TRIGGER trigger_cms_courses_updated_at
  BEFORE UPDATE ON public.cms_courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_cms_updated_at();

DROP TRIGGER IF EXISTS trigger_cms_specializations_updated_at ON public.cms_specializations;
CREATE TRIGGER trigger_cms_specializations_updated_at
  BEFORE UPDATE ON public.cms_specializations
  FOR EACH ROW EXECUTE FUNCTION public.handle_cms_updated_at();

DROP TRIGGER IF EXISTS trigger_cms_live_offers_updated_at ON public.cms_live_offers;
CREATE TRIGGER trigger_cms_live_offers_updated_at
  BEFORE UPDATE ON public.cms_live_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_cms_updated_at();

DROP TRIGGER IF EXISTS trigger_cms_tutoring_updated_at ON public.cms_tutoring;
CREATE TRIGGER trigger_cms_tutoring_updated_at
  BEFORE UPDATE ON public.cms_tutoring
  FOR EACH ROW EXECUTE FUNCTION public.handle_cms_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.cms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_live_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_tutoring ENABLE ROW LEVEL SECURITY;

-- Public can SELECT published items
CREATE POLICY "Public read published courses" ON public.cms_courses
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "Public read published specializations" ON public.cms_specializations
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "Public read published live offers" ON public.cms_live_offers
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "Public read published tutoring" ON public.cms_tutoring
  FOR SELECT TO anon, authenticated USING (published = true);

-- Elevated Service Role bypasses RLS for admin mutations

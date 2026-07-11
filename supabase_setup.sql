-- ====================================================================
-- COMPREHENSIVE SUPABASE DATABASE SETUP FOR B2BFIY DIGITAL AGENCY
-- ====================================================================
-- Copy and paste this entire script into your Supabase SQL Editor and click 'Run'.
-- This will create all individual tables for a fully structured, relational database!

-- --------------------------------------------------------------------
-- 1. ADMIN USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 2. GENERAL SITE SETTINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_text TEXT,
  whatsapp_number TEXT,
  footer_text TEXT,
  footer_address TEXT,
  footer_email TEXT,
  logo_display_mode TEXT DEFAULT 'both',
  seo_description TEXT,
  seo_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  stat_projects_value INT DEFAULT 0,
  stat_projects_label TEXT,
  stat_clients_value INT DEFAULT 0,
  stat_clients_label TEXT,
  stat_experience_value INT DEFAULT 0,
  stat_experience_label TEXT,
  stat_success_value INT DEFAULT 0,
  stat_success_label TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- --------------------------------------------------------------------
-- 3. SERVICES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  short_description TEXT,
  cover_image_url TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. SERVICE SUB-TASKS (SERVICE DETAILS) TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_details (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0
);

-- --------------------------------------------------------------------
-- 5. CLIENT LOGOS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_logos (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- --------------------------------------------------------------------
-- 6. VIDEO CATEGORIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- --------------------------------------------------------------------
-- 7. VIDEO PORTFOLIO TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_portfolio (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. GRAPHICS PORTFOLIO TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS graphics_portfolio (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- --------------------------------------------------------------------
-- 9. GRAPHICS SETTINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS graphics_settings (
  id INT PRIMARY KEY DEFAULT 1,
  view_all_link TEXT NOT NULL DEFAULT 'https://behance.net'
);

-- --------------------------------------------------------------------
-- 10. WEB PORTFOLIO TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS web_portfolio (
  id TEXT PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  demo_link TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- --------------------------------------------------------------------
-- 11. REVIEWS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_photo_url TEXT,
  designation TEXT,
  rating INT NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- --------------------------------------------------------------------
-- 12. CONTACT SUBMISSIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service_interested TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- --------------------------------------------------------------------
-- 13. LEGACY SINGLE-STATE CONFIG TABLE (BACKWARDS COMPATIBILITY FALLBACK)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_config (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR CONVENIENCE (RECOMMENDED FOR LANDING PAGES)
-- ====================================================================
-- By disabling RLS, your frontend/backend can directly read/write data easily.
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_logos DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE graphics_portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE graphics_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE web_portfolio DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;

-- If you want to enable RLS and create public policies instead, you can run:
-- ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON site_settings FOR SELECT USING (true);
-- CREATE POLICY "Allow all actions" ON site_settings FOR ALL USING (true) WITH CHECK (true);
-- (Repeat for other tables if RLS is desired)

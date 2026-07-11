-- ====================================================================
-- SUPABASE TABLE SETUP FOR B2BFIY DIGITAL AGENCY
-- ====================================================================
-- Copy and paste this script into your Supabase SQL Editor and run it.
-- This will create the required table and configure Row Level Security (RLS).

-- 1. Create the site_config table to store all website settings & content
CREATE TABLE IF NOT EXISTS site_config (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) to protect your table
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow EVERYONE (public) to view/read the website data
CREATE POLICY "Allow public read access" ON site_config
  FOR SELECT USING (true);

-- 4. Create policy to allow insert/update operations (needed for saving changes)
CREATE POLICY "Allow all access" ON site_config
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Insert default seed data (the backend will automatically populate this on first load if empty, but you can also pre-initialize it)
-- INSERT INTO site_config (id, data) VALUES (1, '{}');

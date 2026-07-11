import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL script for creating the table in Supabase SQL Editor:
 * 
 * -- 1. Create the table
 * CREATE TABLE IF NOT EXISTS site_config (
 *   id INT PRIMARY KEY DEFAULT 1,
 *   data JSONB NOT NULL,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
 * );
 * 
 * -- 2. Enable Row Level Security
 * ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
 * 
 * -- 3. Create Policy for public read access (everyone can view the website)
 * CREATE POLICY "Allow public read access" ON site_config
 *   FOR SELECT USING (true);
 * 
 * -- 4. Create Policy for update access
 * CREATE POLICY "Allow public write/update access" ON site_config
 *   FOR ALL USING (true) WITH CHECK (true);
 */

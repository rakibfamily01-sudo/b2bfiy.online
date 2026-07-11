import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL present:', !!url);
console.log('Supabase Key present:', !!key);

if (url && key) {
  const client = createClient(url, key);
  (async () => {
    try {
      console.log('Testing query on site_config...');
      const { data, error } = await client.from('site_config').select('id');
      if (error) {
        console.error('Error returned from Supabase:', error);
      } else {
        console.log('Success! Table exists and contains rows:', data);
      }
    } catch (err) {
      console.error('Exception during test:', err);
    }
  })();
} else {
  console.log('Supabase is not configured yet in environment variables.');
}

import { createClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client using the public anon key.
 * Used ONLY for the realtime subscription on the `requests` table.
 * All actual data reads/writes go through our own /api routes.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

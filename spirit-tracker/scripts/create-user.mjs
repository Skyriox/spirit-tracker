/**
 * Create a Spirit Tracker account with a username + numeric PIN (no email needed).
 *
 * Usage:
 *   node scripts/create-user.mjs <username> <pin>
 *   npm run create-user -- maya 0000
 *
 * Requires .env.local to have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const [, , username, pin] = process.argv;

if (!username || !pin) {
  console.error('Usage: npm run create-user -- <username> <pin>');
  console.error('Example: npm run create-user -- maya 0000');
  process.exit(1);
}

if (!/^\d{4,8}$/.test(pin)) {
  console.error('PIN must be 4-8 digits, e.g. 0000');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const normalizedUsername = username.trim().toLowerCase();
const pinHash = await bcrypt.hash(pin, 10);
const avatar = `https://api.dicebear.com/9.x/big-smile/svg?seed=${encodeURIComponent(
  normalizedUsername
)}&backgroundType=gradientLinear`;

const { data: existing } = await supabase
  .from('users')
  .select('id')
  .eq('username', normalizedUsername)
  .maybeSingle();

if (existing) {
  console.error(`A user named "${normalizedUsername}" already exists.`);
  process.exit(1);
}

const { data, error } = await supabase
  .from('users')
  .insert({ username: normalizedUsername, pin_hash: pinHash, avatar })
  .select()
  .single();

if (error) {
  console.error('Failed to create user:', error.message);
  process.exit(1);
}

console.log(`✅ Created user "${data.username}" (id: ${data.id})`);
console.log('They can now log in at /login with that username and PIN.');
console.log('Next step: have them create a group, or join one with an invite code.');

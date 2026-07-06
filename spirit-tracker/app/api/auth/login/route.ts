import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
  const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';

  if (!username || !pin) {
    return NextResponse.json({ error: 'Enter a username and PIN.' }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, pin_hash, avatar, group_id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: 'That username doesn\u2019t exist.' }, { status: 401 });
  }

  const pinMatches = await bcrypt.compare(pin, user.pin_hash);
  if (!pinMatches) {
    return NextResponse.json({ error: 'Wrong PIN. Try again.' }, { status: 401 });
  }

  await createSession({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    group_id: user.group_id,
  });

  return NextResponse.json({
    user: { id: user.id, username: user.username, avatar: user.avatar, group_id: user.group_id },
  });
}

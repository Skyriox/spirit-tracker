import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';

/** GET: all requests involving the current user (incoming + outgoing), joined with spirit + usernames. */
export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await supabaseAdmin
    .from('requests')
    .select(
      'id, from_user, to_user, spirit_id, status, created_at, updated_at, spirit:spirits(id, name, rarity, image)'
    )
    .or(`from_user.eq.${auth.user.id},to_user.eq.${auth.user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load requests.' }, { status: 500 });
  }

  // Fetch usernames for everyone involved in one extra query.
  const userIds = Array.from(
    new Set((data ?? []).flatMap((r) => [r.from_user, r.to_user]))
  );
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const enriched = (data ?? []).map((r) => ({
    ...r,
    from_username: userMap.get(r.from_user)?.username ?? 'Unknown',
    to_username: userMap.get(r.to_user)?.username ?? 'Unknown',
  }));

  const incoming = enriched.filter((r) => r.to_user === auth.user.id);
  const outgoing = enriched.filter((r) => r.from_user === auth.user.id);

  return NextResponse.json({ incoming, outgoing });
}

/** POST: create a new request { toUser, spiritId }. */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const toUser = typeof body?.toUser === 'string' ? body.toUser : '';
  const spiritId = typeof body?.spiritId === 'string' ? body.spiritId : '';

  if (!toUser || !spiritId) {
    return NextResponse.json({ error: 'Missing toUser or spiritId.' }, { status: 400 });
  }
  if (toUser === auth.user.id) {
    return NextResponse.json({ error: 'You can\u2019t request a spirit from yourself.' }, { status: 400 });
  }

  // Prevent duplicate pending requests for the same spirit/recipient.
  const { data: existing } = await supabaseAdmin
    .from('requests')
    .select('id')
    .eq('from_user', auth.user.id)
    .eq('to_user', toUser)
    .eq('spirit_id', spiritId)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'You already asked them for this spirit.' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('requests')
    .insert({ from_user: auth.user.id, to_user: toUser, spirit_id: spiritId, status: 'pending' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not send the request.' }, { status: 500 });
  }

  return NextResponse.json({ request: data });
}

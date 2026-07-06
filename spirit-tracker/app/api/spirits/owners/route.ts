import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';

/** GET /api/spirits/owners?spiritId=... — group members (other than me) who own this spirit. */
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const spiritId = request.nextUrl.searchParams.get('spiritId');
  if (!spiritId) {
    return NextResponse.json({ error: 'Missing spiritId.' }, { status: 400 });
  }

  const { data: me } = await supabaseAdmin
    .from('users')
    .select('group_id')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (!me?.group_id) {
    return NextResponse.json({ owners: [] });
  }

  const { data: members } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar')
    .eq('group_id', me.group_id)
    .neq('id', auth.user.id);

  const memberIds = (members ?? []).map((m) => m.id);
  if (memberIds.length === 0) {
    return NextResponse.json({ owners: [] });
  }

  const { data: ownership } = await supabaseAdmin
    .from('user_spirits')
    .select('user_id')
    .eq('spirit_id', spiritId)
    .eq('owned', true)
    .in('user_id', memberIds);

  const ownerIds = new Set((ownership ?? []).map((r) => r.user_id));
  const owners = (members ?? []).filter((m) => ownerIds.has(m.id));

  return NextResponse.json({ owners });
}

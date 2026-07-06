import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code) {
    return NextResponse.json({ error: 'Enter an invite code.' }, { status: 400 });
  }

  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .select('*')
    .eq('invite_code', code)
    .maybeSingle();

  if (groupError || !group) {
    return NextResponse.json({ error: 'No group found with that code.' }, { status: 404 });
  }

  const { error: userError } = await supabaseAdmin
    .from('users')
    .update({ group_id: group.id })
    .eq('id', auth.user.id);

  if (userError) {
    return NextResponse.json({ error: 'Could not join that group.' }, { status: 500 });
  }

  await createSession({ ...auth.user, group_id: group.id });

  return NextResponse.json({ group });
}

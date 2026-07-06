import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { generateInviteCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Give your group a name.' }, { status: 400 });
  }

  // Generate a unique invite code, retrying on the rare collision.
  let inviteCode = generateInviteCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .maybeSingle();
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();

  if (groupError || !group) {
    return NextResponse.json({ error: 'Could not create the group.' }, { status: 500 });
  }

  const { error: userError } = await supabaseAdmin
    .from('users')
    .update({ group_id: group.id })
    .eq('id', auth.user.id);

  if (userError) {
    return NextResponse.json({ error: 'Group created, but joining it failed.' }, { status: 500 });
  }

  await createSession({ ...auth.user, group_id: group.id });

  return NextResponse.json({ group });
}

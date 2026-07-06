import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const spiritId = typeof body?.spiritId === 'string' ? body.spiritId : '';
  const owned = Boolean(body?.owned);

  if (!spiritId) {
    return NextResponse.json({ error: 'Missing spiritId.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('user_spirits')
    .upsert(
      { user_id: auth.user.id, spirit_id: spiritId, owned, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,spirit_id' }
    );

  if (error) {
    return NextResponse.json({ error: 'Could not update your collection.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, spiritId, owned });
}

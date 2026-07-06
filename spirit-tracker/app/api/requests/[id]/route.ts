import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (status !== 'accepted' && status !== 'rejected') {
    return NextResponse.json({ error: 'Status must be accepted or rejected.' }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }
  if (existing.to_user !== auth.user.id) {
    return NextResponse.json({ error: 'Only the recipient can respond to this request.' }, { status: 403 });
  }
  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'This request was already answered.' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not update the request.' }, { status: 500 });
  }

  return NextResponse.json({ request: data });
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';
import type { SpiritWithOwnership } from '@/types';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data: spirits, error: spiritsError } = await supabaseAdmin
    .from('spirits')
    .select('*')
    .order('rarity', { ascending: true })
    .order('name', { ascending: true });

  if (spiritsError) {
    return NextResponse.json({ error: 'Could not load the spirit catalog.' }, { status: 500 });
  }

  const { data: owned, error: ownedError } = await supabaseAdmin
    .from('user_spirits')
    .select('spirit_id, owned')
    .eq('user_id', auth.user.id)
    .eq('owned', true);

  if (ownedError) {
    return NextResponse.json({ error: 'Could not load your collection.' }, { status: 500 });
  }

  const ownedIds = new Set((owned ?? []).map((row) => row.spirit_id));
  const merged: SpiritWithOwnership[] = (spirits ?? []).map((spirit) => ({
    ...spirit,
    owned: ownedIds.has(spirit.id),
  }));

  return NextResponse.json({ spirits: merged });
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireUser } from '@/lib/auth';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data: me } = await supabaseAdmin
    .from('users')
    .select('group_id')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (!me?.group_id) {
    return NextResponse.json({ helpMe: [], iCanHelp: [] });
  }

  const [{ data: members }, { data: allOwnership }, { data: spirits }] = await Promise.all([
    supabaseAdmin.from('users').select('id, username, avatar').eq('group_id', me.group_id),
    supabaseAdmin
      .from('user_spirits')
      .select('user_id, spirit_id, owned')
      .eq('owned', true),
    supabaseAdmin.from('spirits').select('id, name, rarity, image'),
  ]);

  const spiritMap = new Map((spirits ?? []).map((s) => [s.id, s]));
  const memberList = (members ?? []).filter((m) => m.id !== auth.user.id);

  // spirit_id -> set of user_ids who own it
  const ownersBySpirit = new Map<string, Set<string>>();
  for (const row of allOwnership ?? []) {
    if (!ownersBySpirit.has(row.spirit_id)) ownersBySpirit.set(row.spirit_id, new Set());
    ownersBySpirit.get(row.spirit_id)!.add(row.user_id);
  }

  const myOwnedIds = new Set(
    (allOwnership ?? []).filter((r) => r.user_id === auth.user.id).map((r) => r.spirit_id)
  );
  const myMissingIds = (spirits ?? []).map((s) => s.id).filter((id) => !myOwnedIds.has(id));

  // "Who can help me" — group members who own something I'm missing.
  const helpMe = memberList
    .map((member) => {
      const spiritsTheyHave = myMissingIds.filter((spiritId) =>
        ownersBySpirit.get(spiritId)?.has(member.id)
      );
      return {
        user: member,
        spirits: spiritsTheyHave.map((id) => spiritMap.get(id)).filter(Boolean),
      };
    })
    .filter((entry) => entry.spirits.length > 0)
    .sort((a, b) => b.spirits.length - a.spirits.length);

  // "Spirits I can help others with" — spirits I own that some member is missing.
  const iCanHelp = Array.from(myOwnedIds)
    .map((spiritId) => {
      const owners = ownersBySpirit.get(spiritId) ?? new Set();
      const needers = memberList.filter((m) => !owners.has(m.id));
      return {
        spirit: spiritMap.get(spiritId),
        users: needers,
      };
    })
    .filter((entry) => entry.spirit && entry.users.length > 0)
    .sort((a, b) => b.users.length - a.users.length);

  return NextResponse.json({ helpMe, iCanHelp });
}

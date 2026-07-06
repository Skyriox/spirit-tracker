import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { GroupMemberProgress, Group } from '@/types';

/** Fetch the group a user belongs to, or null. */
export async function getGroupForUser(userId: string): Promise<Group | null> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('group_id')
    .eq('id', userId)
    .maybeSingle();

  if (!user?.group_id) return null;

  const { data: group } = await supabaseAdmin
    .from('groups')
    .select('*')
    .eq('id', user.group_id)
    .maybeSingle();

  return group ?? null;
}

/** Progress (owned/total/percent) for every member of a group. */
export async function getGroupProgress(groupId: string): Promise<GroupMemberProgress[]> {
  const [{ data: members }, { count: totalSpirits }, { data: ownership }] = await Promise.all([
    supabaseAdmin.from('users').select('id, username, avatar').eq('group_id', groupId),
    supabaseAdmin.from('spirits').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('user_spirits').select('user_id, owned').eq('owned', true),
  ]);

  const total = totalSpirits ?? 0;
  const ownedCountByUser = new Map<string, number>();
  for (const row of ownership ?? []) {
    ownedCountByUser.set(row.user_id, (ownedCountByUser.get(row.user_id) ?? 0) + 1);
  }

  return (members ?? []).map((member) => {
    const ownedCount = ownedCountByUser.get(member.id) ?? 0;
    return {
      id: member.id,
      username: member.username,
      avatar: member.avatar,
      ownedCount,
      totalCount: total,
      percent: total > 0 ? Math.round((ownedCount / total) * 100) : 0,
    };
  });
}

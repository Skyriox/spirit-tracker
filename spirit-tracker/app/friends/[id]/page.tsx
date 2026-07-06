import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Navbar from '@/components/Navbar';
import Avatar from '@/components/Avatar';
import ProgressBar from '@/components/ProgressBar';
import SpiritCard from '@/components/SpiritCard';
import type { SpiritWithOwnership } from '@/types';

export default async function FriendPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.group_id) redirect('/group');

  const { data: friend } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar, group_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!friend || friend.group_id !== user.group_id) {
    notFound();
  }

  const [{ data: spirits }, { data: ownership }] = await Promise.all([
    supabaseAdmin.from('spirits').select('*').order('rarity').order('name'),
    supabaseAdmin.from('user_spirits').select('spirit_id, owned').eq('user_id', friend.id).eq('owned', true),
  ]);

  const ownedIds = new Set((ownership ?? []).map((r) => r.spirit_id));
  const merged: SpiritWithOwnership[] = (spirits ?? []).map((s) => ({ ...s, owned: ownedIds.has(s.id) }));
  const owned = merged.filter((s) => s.owned);
  const missing = merged.filter((s) => !s.owned);
  const percent = merged.length > 0 ? Math.round((owned.length / merged.length) * 100) : 0;

  return (
    <main className="min-h-screen pb-16">
      <Navbar user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Link href="/group" className="mb-4 inline-block text-sm text-white/50 hover:text-white">
          ← Back to group
        </Link>

        <div className="glass-panel mb-8 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Avatar src={friend.avatar} alt={friend.username} size={72} glow />
          <div className="flex-1 w-full">
            <h1 className="font-display text-2xl font-extrabold">{friend.username}</h1>
            <div className="mt-2">
              <ProgressBar percent={percent} label={`${owned.length}/${merged.length} spirits collected`} />
            </div>
          </div>
          {percent >= 100 && <span className="text-4xl">🏆</span>}
        </div>

        <section className="mb-10">
          <h2 className="mb-3 font-display text-xl font-extrabold">✅ Owned ({owned.length})</h2>
          {owned.length === 0 ? (
            <p className="text-white/50">Nothing yet — send some encouragement!</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {owned.map((s) => (
                <SpiritCard key={s.id} name={s.name} rarity={s.rarity} owned readOnly />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-extrabold">❓ Missing ({missing.length})</h2>
          {missing.length === 0 ? (
            <p className="text-white/50">Full collection — nothing missing!</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {missing.map((s) => (
                <SpiritCard key={s.id} name={s.name} rarity={s.rarity} owned={false} readOnly />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

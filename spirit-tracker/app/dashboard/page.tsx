import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getGroupForUser } from '@/lib/data';
import Navbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import RequestPanel from '@/components/RequestPanel';
import SuggestionPanel from '@/components/SuggestionPanel';
import SpiritCard from '@/components/SpiritCard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const group = await getGroupForUser(user.id);
  if (!group) redirect('/group');

  const [{ data: spirits }, { data: ownership }, { count: pendingIncoming }] = await Promise.all([
    supabaseAdmin.from('spirits').select('*'),
    supabaseAdmin.from('user_spirits').select('spirit_id, owned').eq('user_id', user.id).eq('owned', true),
    supabaseAdmin
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('to_user', user.id)
      .eq('status', 'pending'),
  ]);

  const ownedIds = new Set((ownership ?? []).map((r) => r.spirit_id));
  const total = spirits?.length ?? 0;
  const ownedCount = ownedIds.size;
  const percent = total > 0 ? Math.round((ownedCount / total) * 100) : 0;
  const missing = (spirits ?? []).filter((s) => !ownedIds.has(s.id)).slice(0, 5);

  return (
    <main className="min-h-screen pb-16">
      <Navbar user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="mb-1 font-display text-3xl font-extrabold">
          Hey {user.username}! 👋
        </h1>
        <p className="mb-6 text-white/60">Here&apos;s what&apos;s happening in {group.name}.</p>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel p-5">
            <p className="text-sm text-white/50">Your progress</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-spirit-cyan">{percent}%</p>
            <ProgressBar percent={percent} size="sm" />
          </div>
          <div className="glass-panel p-5">
            <p className="text-sm text-white/50">Spirits missing</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-spirit-pink">
              {total - ownedCount}
            </p>
            <p className="mt-1 text-xs text-white/40">out of {total} total</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-sm text-white/50">New requests</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-spirit-gold">
              {pendingIncoming ?? 0}
            </p>
            <Link href="/requests" className="mt-1 inline-block text-xs text-spirit-cyan hover:underline">
              View requests →
            </Link>
          </div>
        </div>

        {percent >= 100 && (
          <div className="glass-panel mb-8 flex items-center gap-3 p-5 shadow-glow-legendary">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="font-display font-extrabold text-spirit-gold">Full collection!</p>
              <p className="text-sm text-white/60">You&apos;ve caught every spirit. Legendary work.</p>
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">❓ Spirits you&apos;re missing</h2>
              <Link href="/spirits" className="text-sm text-spirit-cyan hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {missing.map((s) => (
                <SpiritCard key={s.id} name={s.name} rarity={s.rarity} owned={false} readOnly />
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-3 font-display text-xl font-extrabold">💡 Suggestions</h2>
          <SuggestionPanel />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">🔔 Active requests</h2>
            <Link href="/requests" className="text-sm text-spirit-cyan hover:underline">
              See all →
            </Link>
          </div>
          <RequestPanel userId={user.id} compact />
        </section>
      </div>
    </main>
  );
}

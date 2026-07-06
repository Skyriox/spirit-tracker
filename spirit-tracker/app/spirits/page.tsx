import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import SpiritsBoard from '@/components/SpiritsBoard';

export default async function SpiritsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.group_id) redirect('/group');

  return (
    <main className="min-h-screen pb-16">
      <Navbar user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="mb-1 font-display text-3xl font-extrabold">🧿 Spirit Catalog</h1>
        <p className="mb-6 text-white/60">Tap a card to mark it, or ask a friend for the ones you&apos;re missing.</p>
        <SpiritsBoard />
      </div>
    </main>
  );
}

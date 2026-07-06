import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import RequestPanel from '@/components/RequestPanel';

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.group_id) redirect('/group');

  return (
    <main className="min-h-screen pb-16">
      <Navbar user={user} />
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <h1 className="mb-1 font-display text-3xl font-extrabold">🔔 Requests</h1>
        <p className="mb-6 text-white/60">Keep track of spirits you&apos;ve asked for, and help out your friends.</p>
        <RequestPanel userId={user.id} />
      </div>
    </main>
  );
}

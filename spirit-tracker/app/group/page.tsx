import { getCurrentUser } from '@/lib/auth';
import { getGroupForUser, getGroupProgress } from '@/lib/data';
import Navbar from '@/components/Navbar';
import GroupForms from '@/components/GroupForms';
import InviteCodeChip from '@/components/InviteCodeChip';
import Avatar from '@/components/Avatar';
import ProgressBar from '@/components/ProgressBar';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function GroupPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const group = await getGroupForUser(user.id);

  if (!group) {
    return (
      <main className="min-h-screen">
        <Navbar user={user} />
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
          <div className="text-center">
            <div className="mb-6 text-6xl animate-float">👥</div>
            <h1 className="mb-2 font-display text-3xl font-extrabold">Join the adventure!</h1>
            <p className="mb-6 text-white/60">Create a group for your friends, or join one with a code.</p>
            <GroupForms />
          </div>
        </div>
      </main>
    );
  }

  const progress = await getGroupProgress(group.id);

  return (
    <main className="min-h-screen pb-16">
      <Navbar user={user} />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="glass-panel mb-8 p-6 text-center">
          <p className="mb-1 text-sm font-bold uppercase tracking-widest text-white/50">Your group</p>
          <h1 className="mb-4 font-display text-3xl font-extrabold">{group.name}</h1>
          <p className="mb-2 text-sm text-white/60">Share this code so friends can join:</p>
          <InviteCodeChip code={group.invite_code} />
        </div>

        <h2 className="mb-3 font-display text-xl font-extrabold">👥 Members</h2>
        <div className="flex flex-col gap-3">
          {progress.map((member) => (
            <Link
              key={member.id}
              href={member.id === user.id ? '/spirits' : `/friends/${member.id}`}
              className="glass-panel flex items-center gap-4 p-4 transition hover:bg-white/10"
            >
              <Avatar src={member.avatar} alt={member.username} size={44} />
              <div className="flex-1">
                <p className="font-display font-bold">
                  {member.username} {member.id === user.id && <span className="text-white/40">(you)</span>}
                </p>
                <ProgressBar percent={member.percent} size="sm" />
              </div>
              <span className="font-display text-sm font-bold text-spirit-cyan">
                {member.ownedCount}/{member.totalCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

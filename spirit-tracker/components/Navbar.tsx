'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { classNames } from '@/lib/utils';
import type { SessionUser } from '@/types';

const LINKS = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/spirits', label: 'Spirits', icon: '🧿' },
  { href: '/requests', label: 'Requests', icon: '🔔' },
  { href: '/group', label: 'Group', icon: '👥' },
];

export default function Navbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40">
      <nav className="glass-panel mx-3 mt-3 flex items-center justify-between gap-2 px-4 py-2.5 md:mx-6 md:mt-4">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl animate-float">🌟</span>
          <span className="font-display text-lg font-extrabold tracking-tight hidden sm:inline">
            Spirit Tracker
          </span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'btn-pop flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-display font-bold whitespace-nowrap transition-colors',
                  active
                    ? 'bg-gradient-to-r from-spirit-violet to-spirit-pink text-white shadow-glow-epic'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <span>{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Avatar src={user.avatar} alt={user.username} size={36} />
          <span className="hidden md:inline font-display font-bold text-sm">{user.username}</span>
          <button
            onClick={handleLogout}
            className="btn-pop rounded-full bg-white/10 px-3 py-2 text-sm font-display font-bold hover:bg-white/20"
            title="Log out"
          >
            🚪
          </button>
        </div>
      </nav>
    </header>
  );
}

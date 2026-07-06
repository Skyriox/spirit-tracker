'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from './Avatar';
import RarityBadge from './RarityBadge';
import Loader from './Loader';
import type { Rarity } from '@/types';

interface HelpMeEntry {
  user: { id: string; username: string; avatar: string };
  spirits: { id: string; name: string; rarity: Rarity }[];
}
interface ICanHelpEntry {
  spirit: { id: string; name: string; rarity: Rarity };
  users: { id: string; username: string; avatar: string }[];
}

export default function SuggestionPanel() {
  const [helpMe, setHelpMe] = useState<HelpMeEntry[] | null>(null);
  const [iCanHelp, setICanHelp] = useState<ICanHelpEntry[] | null>(null);

  useEffect(() => {
    fetch('/api/suggestions')
      .then((res) => res.json())
      .then((data) => {
        setHelpMe(data.helpMe ?? []);
        setICanHelp(data.iCanHelp ?? []);
      });
  }, []);

  if (helpMe === null || iCanHelp === null) return <Loader label="Scouting for trades…" />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="glass-panel p-5">
        <h3 className="mb-3 font-display text-lg font-extrabold">🧭 Who can help you</h3>
        {helpMe.length === 0 && (
          <p className="text-sm text-white/50">Nobody has spirits you&apos;re missing right now.</p>
        )}
        <div className="flex flex-col gap-3">
          {helpMe.map((entry) => (
            <Link
              key={entry.user.id}
              href={`/friends/${entry.user.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 transition hover:bg-white/10"
            >
              <Avatar src={entry.user.avatar} alt={entry.user.username} size={36} />
              <div className="flex-1">
                <p className="font-display font-bold">{entry.user.username}</p>
                <p className="text-xs text-white/50">
                  Has {entry.spirits.length} spirit{entry.spirits.length > 1 ? 's' : ''} you need
                </p>
              </div>
              <div className="hidden gap-1 sm:flex">
                {entry.spirits.slice(0, 2).map((s) => (
                  <RarityBadge key={s.id} rarity={s.rarity} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="mb-3 font-display text-lg font-extrabold">🎁 Spirits you can share</h3>
        {iCanHelp.length === 0 && (
          <p className="text-sm text-white/50">Nobody needs what you&apos;ve got — for now!</p>
        )}
        <div className="flex flex-col gap-3">
          {iCanHelp.map((entry) => (
            <div key={entry.spirit.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <div className="flex-1">
                <p className="font-display font-bold">{entry.spirit.name}</p>
                <RarityBadge rarity={entry.spirit.rarity} className="mt-1" />
              </div>
              <div className="flex -space-x-2">
                {entry.users.slice(0, 4).map((u) => (
                  <Avatar key={u.id} src={u.avatar} alt={u.username} size={28} className="ring-2 ring-void" />
                ))}
              </div>
              <span className="text-xs font-bold text-white/50">{entry.users.length} need it</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

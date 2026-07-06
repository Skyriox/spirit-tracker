'use client';

import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import Loader from './Loader';
import type { Spirit } from '@/types';

interface Owner {
  id: string;
  username: string;
  avatar: string;
}

export default function RequestModal({
  spirit,
  onClose,
}: {
  spirit: Spirit;
  onClose: () => void;
}) {
  const [owners, setOwners] = useState<Owner[] | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/spirits/owners?spiritId=${spirit.id}`)
      .then((res) => res.json())
      .then((data) => setOwners(data.owners ?? []));
  }, [spirit.id]);

  async function sendRequest(toUser: string) {
    setError('');
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUser, spiritId: spirit.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Could not send the request.');
      return;
    }
    setSentTo((prev) => new Set(prev).add(toUser));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Ask for {spirit.name}</h2>
          <button onClick={onClose} className="btn-pop rounded-full bg-white/10 px-3 py-1 hover:bg-white/20">
            ✕
          </button>
        </div>

        {owners === null && <Loader label="Looking for friends who have it…" />}

        {owners !== null && owners.length === 0 && (
          <p className="rounded-xl bg-white/5 p-4 text-center text-sm text-white/60">
            Nobody in your group has this spirit yet. 😢
          </p>
        )}

        {error && (
          <p className="mb-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          {owners?.map((owner) => (
            <div key={owner.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <Avatar src={owner.avatar} alt={owner.username} size={36} />
              <span className="flex-1 font-display font-bold">{owner.username}</span>
              <button
                onClick={() => sendRequest(owner.id)}
                disabled={sentTo.has(owner.id)}
                className="btn-pop rounded-full bg-gradient-to-r from-spirit-violet to-spirit-cyan px-4 py-1.5 text-sm font-display font-bold disabled:opacity-50"
              >
                {sentTo.has(owner.id) ? '✅ Sent' : '🙏 Ask'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

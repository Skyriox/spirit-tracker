'use client';

import { useEffect, useState, useCallback } from 'react';
import RequestRow from './RequestRow';
import Loader from './Loader';
import { supabaseClient } from '@/lib/supabaseClient';
import { classNames } from '@/lib/utils';
import type { SpiritRequest } from '@/types';

interface RequestPanelProps {
  userId: string;
  compact?: boolean;
}

export default function RequestPanel({ userId, compact = false }: RequestPanelProps) {
  const [incoming, setIncoming] = useState<SpiritRequest[] | null>(null);
  const [outgoing, setOutgoing] = useState<SpiritRequest[] | null>(null);
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/requests')
      .then((res) => res.json())
      .then((data) => {
        setIncoming(data.incoming ?? []);
        setOutgoing(data.outgoing ?? []);
      });
  }, []);

  useEffect(() => {
    load();

    // Real-time: refresh whenever a request involving this user changes.
    const channel = supabaseClient
      .channel(`requests-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests', filter: `to_user=eq.${userId}` },
        load
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests', filter: `from_user=eq.${userId}` },
        load
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId, load]);

  async function respond(id: string, status: 'accepted' | 'rejected') {
    setRespondingId(id);
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
    setRespondingId(null);
  }

  if (incoming === null || outgoing === null) return <Loader label="Checking for requests…" />;

  const pendingIncoming = incoming.filter((r) => r.status === 'pending');
  const list = tab === 'incoming' ? incoming : outgoing;
  const shown = compact ? list.slice(0, 3) : list;

  return (
    <div>
      {!compact && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab('incoming')}
            className={classNames(
              'btn-pop rounded-full px-4 py-2 text-sm font-display font-bold',
              tab === 'incoming' ? 'bg-gradient-to-r from-spirit-violet to-spirit-pink' : 'bg-white/5 text-white/60'
            )}
          >
            🔔 Incoming {pendingIncoming.length > 0 && `(${pendingIncoming.length})`}
          </button>
          <button
            onClick={() => setTab('outgoing')}
            className={classNames(
              'btn-pop rounded-full px-4 py-2 text-sm font-display font-bold',
              tab === 'outgoing' ? 'bg-gradient-to-r from-spirit-cyan to-spirit-violet' : 'bg-white/5 text-white/60'
            )}
          >
            📤 Sent
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {shown.length === 0 && (
          <p className="rounded-xl bg-white/5 p-4 text-center text-sm text-white/50">
            {tab === 'incoming' ? 'No requests yet — nice and quiet in here.' : 'You haven\u2019t asked for anything yet.'}
          </p>
        )}
        {shown.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            direction={tab}
            onRespond={respond}
            responding={respondingId === request.id}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import SpiritCard from './SpiritCard';
import RequestModal from './RequestModal';
import Loader from './Loader';
import ProgressBar from './ProgressBar';
import { RARITY_ORDER, RARITY_LABEL, classNames } from '@/lib/utils';
import type { Rarity, SpiritWithOwnership } from '@/types';

type Filter = 'all' | 'owned' | 'missing' | Rarity;

export default function SpiritsBoard() {
  const [spirits, setSpirits] = useState<SpiritWithOwnership[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [requestSpirit, setRequestSpirit] = useState<SpiritWithOwnership | null>(null);

  useEffect(() => {
    fetch('/api/spirits')
      .then((res) => res.json())
      .then((data) => setSpirits(data.spirits ?? []));
  }, []);

  async function handleToggle(spirit: SpiritWithOwnership) {
    if (!spirits) return;
    setTogglingId(spirit.id);
    const nextOwned = !spirit.owned;

    // optimistic update
    setSpirits(spirits.map((s) => (s.id === spirit.id ? { ...s, owned: nextOwned } : s)));

    const res = await fetch('/api/user-spirits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spiritId: spirit.id, owned: nextOwned }),
    });

    if (!res.ok) {
      // revert on failure
      setSpirits((prev) => prev!.map((s) => (s.id === spirit.id ? { ...s, owned: !nextOwned } : s)));
    }
    setTogglingId(null);
  }

  const filtered = useMemo(() => {
    if (!spirits) return [];
    if (filter === 'all') return spirits;
    if (filter === 'owned') return spirits.filter((s) => s.owned);
    if (filter === 'missing') return spirits.filter((s) => !s.owned);
    return spirits.filter((s) => s.rarity === filter);
  }, [spirits, filter]);

  const ownedCount = spirits?.filter((s) => s.owned).length ?? 0;
  const total = spirits?.length ?? 0;
  const percent = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

  if (!spirits) return <Loader />;

  return (
    <div>
      <div className="glass-panel mb-6 p-5">
        <ProgressBar percent={percent} label={`Your collection · ${ownedCount}/${total} spirits`} />
        {percent >= 100 && (
          <p className="mt-3 text-center font-display font-extrabold text-spirit-gold">
            🏆 Full collection! You caught &apos;em all!
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'owned', 'missing', ...RARITY_ORDER] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={classNames(
              'btn-pop rounded-full px-4 py-2 text-sm font-display font-bold transition-colors',
              filter === f
                ? 'bg-gradient-to-r from-spirit-violet to-spirit-cyan text-white shadow-glow-epic'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            )}
          >
            {f === 'all' && '🌈 All'}
            {f === 'owned' && '✅ Owned'}
            {f === 'missing' && '❓ Missing'}
            {RARITY_ORDER.includes(f as Rarity) && RARITY_LABEL[f as Rarity]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((spirit) => (
          <SpiritCard
            key={spirit.id}
            name={spirit.name}
            rarity={spirit.rarity}
            owned={spirit.owned}
            toggling={togglingId === spirit.id}
            onToggle={() => handleToggle(spirit)}
            actionSlot={
              !spirit.owned && (
                <button
                  onClick={() => setRequestSpirit(spirit)}
                  className="btn-pop w-full rounded-full border border-spirit-pink/40 bg-spirit-pink/10 py-1.5 text-xs font-display font-bold text-spirit-pink hover:bg-spirit-pink/20"
                >
                  🙏 Request from a friend
                </button>
              )
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-white/50">No spirits match this filter yet.</p>
      )}

      {requestSpirit && (
        <RequestModal spirit={requestSpirit} onClose={() => setRequestSpirit(null)} />
      )}
    </div>
  );
}

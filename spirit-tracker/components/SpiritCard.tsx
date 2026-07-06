'use client';

import type { Rarity } from '@/types';
import RarityBadge from './RarityBadge';
import { classNames } from '@/lib/utils';

const GLOW: Record<Rarity, string> = {
  common: 'shadow-glow-common',
  rare: 'shadow-glow-rare',
  epic: 'shadow-glow-epic',
  legendary: 'shadow-glow-legendary',
};

const RING: Record<Rarity, string> = {
  common: 'ring-rarity-common/40',
  rare: 'ring-rarity-rare/60',
  epic: 'ring-rarity-epic/60',
  legendary: 'ring-rarity-legendary/70',
};

const RARITY_EMOJI: Record<Rarity, string> = {
  common: '🌱',
  rare: '💎',
  epic: '🔮',
  legendary: '👑',
};

interface SpiritCardProps {
  name: string;
  rarity: Rarity;
  owned: boolean;
  onToggle?: () => void;
  toggling?: boolean;
  actionSlot?: React.ReactNode;
  readOnly?: boolean;
}

export default function SpiritCard({
  name,
  rarity,
  owned,
  onToggle,
  toggling,
  actionSlot,
  readOnly = false,
}: SpiritCardProps) {
  return (
    <div
      className={classNames(
        'group relative rounded-3xl p-4 flex flex-col items-center gap-3 text-center',
        'border transition-all duration-300 hover:-translate-y-1.5',
        'bg-white/5 backdrop-blur-md ring-2',
        RING[rarity],
        owned ? GLOW[rarity] : 'opacity-70 grayscale-[0.35] hover:opacity-100 hover:grayscale-0',
        owned ? 'border-white/20' : 'border-white/10'
      )}
    >
      {/* sparkle accents for legendary spirits */}
      {rarity === 'legendary' && owned && (
        <>
          <span className="absolute top-2 right-3 text-lg animate-sparkle">✨</span>
          <span className="absolute bottom-3 left-3 text-sm animate-sparkle [animation-delay:0.6s]">✨</span>
        </>
      )}

      <div
        className={classNames(
          'flex h-20 w-20 items-center justify-center rounded-2xl text-4xl',
          'bg-gradient-to-br from-white/10 to-white/0 group-hover:animate-float'
        )}
        aria-hidden="true"
      >
        {RARITY_EMOJI[rarity]}
      </div>

      <div>
        <h3 className="font-display font-bold text-base leading-tight">{name}</h3>
        <RarityBadge rarity={rarity} className="mt-1.5" />
      </div>

      {!readOnly && onToggle && (
        <button
          onClick={onToggle}
          disabled={toggling}
          className={classNames(
            'btn-pop mt-1 w-full rounded-full py-2 text-sm font-display font-bold transition-colors',
            owned
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-void-deep hover:brightness-110'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
            toggling && 'opacity-60 cursor-wait'
          )}
        >
          {owned ? '✅ I have it' : '➕ Mark as owned'}
        </button>
      )}

      {actionSlot}
    </div>
  );
}

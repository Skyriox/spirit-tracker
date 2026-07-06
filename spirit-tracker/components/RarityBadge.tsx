import type { Rarity } from '@/types';
import { RARITY_LABEL, classNames } from '@/lib/utils';

const STYLES: Record<Rarity, string> = {
  common: 'bg-rarity-common/20 text-gray-200 border-rarity-common/50',
  rare: 'bg-rarity-rare/20 text-sky-200 border-rarity-rare/60',
  epic: 'bg-rarity-epic/20 text-purple-200 border-rarity-epic/60',
  legendary: 'bg-rarity-legendary/20 text-amber-200 border-rarity-legendary/60',
};

export default function RarityBadge({ rarity, className }: { rarity: Rarity; className?: string }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide font-display',
        STYLES[rarity],
        className
      )}
    >
      {rarity === 'legendary' && '✨'} {RARITY_LABEL[rarity]}
    </span>
  );
}

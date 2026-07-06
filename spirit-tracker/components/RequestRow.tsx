'use client';

import Avatar from './Avatar';
import RarityBadge from './RarityBadge';
import { classNames } from '@/lib/utils';
import type { SpiritRequest } from '@/types';

interface RequestRowProps {
  request: SpiritRequest;
  direction: 'incoming' | 'outgoing';
  onRespond?: (id: string, status: 'accepted' | 'rejected') => void;
  responding?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-400/15 text-amber-300',
  accepted: 'bg-emerald-400/15 text-emerald-300',
  rejected: 'bg-red-400/15 text-red-300',
};

export default function RequestRow({ request, direction, onRespond, responding }: RequestRowProps) {
  const otherName = direction === 'incoming' ? request.from_username : request.to_username;
  const otherAvatar =
    direction === 'incoming'
      ? `https://api.dicebear.com/9.x/big-smile/svg?seed=${request.from_username}`
      : `https://api.dicebear.com/9.x/big-smile/svg?seed=${request.to_username}`;

  return (
    <div className="glass-panel flex flex-wrap items-center gap-3 p-4">
      <Avatar src={otherAvatar} alt={otherName ?? ''} size={40} />
      <div className="flex-1 min-w-[140px]">
        <p className="font-display font-bold">
          {direction === 'incoming' ? (
            <>
              <span className="text-spirit-cyan">{otherName}</span> wants your{' '}
              <span className="text-spirit-pink">{request.spirit?.name}</span>
            </>
          ) : (
            <>
              You asked <span className="text-spirit-cyan">{otherName}</span> for{' '}
              <span className="text-spirit-pink">{request.spirit?.name}</span>
            </>
          )}
        </p>
        {request.spirit && <RarityBadge rarity={request.spirit.rarity} className="mt-1" />}
      </div>

      <span
        className={classNames(
          'rounded-full px-3 py-1 text-xs font-bold font-display capitalize',
          STATUS_STYLES[request.status]
        )}
      >
        {request.status}
      </span>

      {direction === 'incoming' && request.status === 'pending' && onRespond && (
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={() => onRespond(request.id, 'accepted')}
            disabled={responding}
            className="btn-pop flex-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-sm font-display font-bold text-void-deep disabled:opacity-60 sm:flex-none"
          >
            ✅ Accept
          </button>
          <button
            onClick={() => onRespond(request.id, 'rejected')}
            disabled={responding}
            className="btn-pop flex-1 rounded-full bg-white/10 px-4 py-2 text-sm font-display font-bold hover:bg-white/20 disabled:opacity-60 sm:flex-none"
          >
            ❌ Decline
          </button>
        </div>
      )}
    </div>
  );
}

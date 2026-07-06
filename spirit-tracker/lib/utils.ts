import type { Rarity } from '@/types';

/** Generate a friendly 6-character invite code, e.g. "F3X9QP" */
export function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Deterministic fun avatar URL from a seed (username), via DiceBear. */
export function avatarUrlForSeed(seed: string): string {
  return `https://api.dicebear.com/9.x/big-smile/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundType=gradientLinear`;
}

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

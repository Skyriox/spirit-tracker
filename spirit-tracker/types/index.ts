export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  group_id: string | null;
  created_at: string;
}

/** User shape as returned by our own session (never includes pin_hash) */
export interface SessionUser {
  id: string;
  username: string;
  avatar: string;
  group_id: string | null;
}

export interface Spirit {
  id: string;
  name: string;
  rarity: Rarity;
  image: string;
  created_at: string;
}

export interface UserSpirit {
  user_id: string;
  spirit_id: string;
  owned: boolean;
  updated_at: string;
}

export interface SpiritRequest {
  id: string;
  from_user: string;
  to_user: string;
  spirit_id: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  // joined convenience fields, populated by API routes
  spirit?: Spirit;
  from_username?: string;
  to_username?: string;
}

/** Spirit merged with the current viewer's ownership flag, used across the UI */
export interface SpiritWithOwnership extends Spirit {
  owned: boolean;
}

export interface GroupMemberProgress {
  id: string;
  username: string;
  avatar: string;
  ownedCount: number;
  totalCount: number;
  percent: number;
}

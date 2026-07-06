import { getSession } from '@/lib/session';
import type { SessionUser } from '@/types';

/** Get the current session user, or null if not logged in. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

/** Throws-free helper for API routes: returns the user or a 401 payload. */
export async function requireUser(): Promise<
  { user: SessionUser } | { error: string; status: number }
> {
  const user = await getSession();
  if (!user) {
    return { error: 'Not logged in.', status: 401 };
  }
  return { user };
}

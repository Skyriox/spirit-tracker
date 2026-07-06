'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not log in.');
      return;
    }

    router.push(data.user.group_id ? '/dashboard' : '/group');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl animate-float">🌟</div>
          <h1 className="font-display text-3xl font-extrabold">Spirit Tracker</h1>
          <p className="mt-1 text-sm text-white/60">
            Enter your username and secret PIN to open your collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-bold font-display">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. maya"
              autoComplete="username"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30 focus:border-spirit-cyan"
              required
            />
          </div>

          <div>
            <label htmlFor="pin" className="mb-1 block text-sm font-bold font-display">
              PIN
            </label>
            <input
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 0000"
              inputMode="numeric"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 tracking-[0.3em] outline-none placeholder:tracking-normal placeholder:text-white/30 focus:border-spirit-cyan"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-pop mt-2 rounded-full bg-gradient-to-r from-spirit-violet via-spirit-pink to-spirit-cyan py-3 font-display font-extrabold shadow-glow-epic transition disabled:opacity-60"
          >
            {loading ? 'Opening portal…' : '✨ Enter'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Don&apos;t have an account? Ask whoever set up your group to create one for you.
        </p>
      </div>
    </main>
  );
}

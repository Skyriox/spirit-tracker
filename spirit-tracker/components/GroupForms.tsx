'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GroupForms() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = mode === 'create' ? '/api/groups/create' : '/api/groups/join';
    const body = mode === 'create' ? { name } : { code };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="glass-panel w-full max-w-md p-8">
      <div className="mb-6 flex rounded-full bg-white/5 p-1">
        <button
          onClick={() => setMode('create')}
          className={`btn-pop flex-1 rounded-full py-2 text-sm font-display font-bold transition ${
            mode === 'create' ? 'bg-gradient-to-r from-spirit-violet to-spirit-pink' : 'text-white/60'
          }`}
        >
          🏗️ Create group
        </button>
        <button
          onClick={() => setMode('join')}
          className={`btn-pop flex-1 rounded-full py-2 text-sm font-display font-bold transition ${
            mode === 'join' ? 'bg-gradient-to-r from-spirit-cyan to-spirit-violet' : 'text-white/60'
          }`}
        >
          🔑 Join group
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'create' ? (
          <div>
            <label className="mb-1 block text-sm font-bold font-display">Group name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Spirit Squad"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none placeholder:text-white/30 focus:border-spirit-cyan"
              required
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-bold font-display">Invite code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. F3X9QP"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 uppercase tracking-widest outline-none placeholder:text-white/30 placeholder:tracking-normal focus:border-spirit-cyan"
              required
            />
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-pop mt-2 rounded-full bg-gradient-to-r from-spirit-violet via-spirit-pink to-spirit-cyan py-3 font-display font-extrabold shadow-glow-epic disabled:opacity-60"
        >
          {loading ? 'Working…' : mode === 'create' ? '✨ Create my group' : '🚪 Join group'}
        </button>
      </form>
    </div>
  );
}

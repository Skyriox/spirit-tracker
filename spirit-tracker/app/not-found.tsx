import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl animate-float">👻</span>
      <h1 className="font-display text-3xl font-extrabold">This spirit vanished</h1>
      <p className="text-white/60">We couldn&apos;t find what you were looking for.</p>
      <Link
        href="/dashboard"
        className="btn-pop rounded-full bg-gradient-to-r from-spirit-violet to-spirit-cyan px-6 py-3 font-display font-bold shadow-glow-epic"
      >
        ← Back home
      </Link>
    </main>
  );
}

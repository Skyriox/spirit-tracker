export default function Loader({ label = 'Summoning spirits…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/70">
      <span className="text-4xl animate-float">🔮</span>
      <p className="font-display font-bold">{label}</p>
    </div>
  );
}

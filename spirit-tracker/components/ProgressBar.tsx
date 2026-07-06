import { classNames } from '@/lib/utils';

interface ProgressBarProps {
  percent: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({ percent, label, size = 'md' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const height = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-5' : 'h-3.5';

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-sm font-bold font-display">
          <span>{label}</span>
          <span className="text-spirit-cyan">{clamped}%</span>
        </div>
      )}
      <div className={classNames('w-full rounded-full bg-white/10 overflow-hidden', height)}>
        <div
          className={classNames(
            'h-full rounded-full bg-gradient-to-r from-spirit-violet via-spirit-pink to-spirit-cyan transition-all duration-700 ease-out',
            clamped >= 100 && 'animate-pulseGlow'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

import Image from 'next/image';
import { classNames } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  glow?: boolean;
  className?: string;
}

export default function Avatar({ src, alt, size = 48, glow = false, className }: AvatarProps) {
  return (
    <div
      className={classNames(
        'relative rounded-full overflow-hidden ring-2 ring-white/20 bg-void-light shrink-0',
        glow && 'shadow-glow-epic',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" unoptimized />
    </div>
  );
}

import type { Metadata } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import './globals.css';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spirit Tracker',
  description: 'Track, collect, and trade spirits with your friend group.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body>
        {/* Ambient floating blobs for the playful background — decorative only */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-blob bg-spirit-violet/30 blur-3xl animate-blob" />
          <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-blob bg-spirit-cyan/20 blur-3xl animate-blob [animation-delay:-4s]" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-blob bg-spirit-pink/20 blur-3xl animate-blob [animation-delay:-8s]" />
        </div>
        {children}
      </body>
    </html>
  );
}

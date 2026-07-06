/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#160f30',
          light: '#231a4a',
          deep: '#0d0821',
        },
        spirit: {
          violet: '#7C3AED',
          cyan: '#22D3EE',
          pink: '#F472B6',
          gold: '#FBBF24',
        },
        rarity: {
          common: '#9CA3AF',
          rare: '#38BDF8',
          epic: '#A855F7',
          legendary: '#FBBF24',
        },
      },
      fontFamily: {
        display: ['var(--font-baloo)', 'system-ui', 'sans-serif'],
        body: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-common': '0 0 14px 2px rgba(156,163,175,0.35)',
        'glow-rare': '0 0 18px 3px rgba(56,189,248,0.55)',
        'glow-epic': '0 0 22px 4px rgba(168,85,247,0.6)',
        'glow-legendary': '0 0 28px 6px rgba(251,191,36,0.7)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.25)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(20px,-30px) scale(1.1)' },
          '66%': { transform: 'translate(-15px,15px) scale(0.95)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        sparkle: 'sparkle 1.8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        blob: 'blob 12s infinite ease-in-out',
      },
      borderRadius: {
        blob: '42% 58% 65% 35% / 45% 40% 60% 55%',
      },
    },
  },
  plugins: [],
};

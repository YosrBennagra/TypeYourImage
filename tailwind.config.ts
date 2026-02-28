import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        neon: {
          cyan: '#00f0ff',
          purple: '#a855f7',
          green: '#34d399',
          pink: '#f472b6',
          yellow: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

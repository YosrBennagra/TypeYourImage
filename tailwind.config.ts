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
          cyan: '#e07850',
          purple: '#9b8ec8',
          green: '#5fad78',
          pink: '#c4707e',
          yellow: '#cca040',
          orange: '#cc8855',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

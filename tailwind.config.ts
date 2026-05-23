import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#05060d',
        deep: '#0a0b1a',
        nebula: '#10112a',
        'surface-1': '#161830',
        'surface-2': '#1f2247',
        'border-faint': 'rgba(255,255,255,0.06)',
        'border-glow': 'rgba(160,180,255,0.18)',
        'text-primary': '#e8e9ff',
        'text-secondary': '#a8aacc',
        'text-muted': '#5b5d80',
        role: {
          manager: '#f5c45e',
          storefront: '#f59a4f',
          customer: '#4fd0e8',
          email: '#5fa3f0',
          content: '#f06aa3',
          payments: '#5fdba0',
          analytics: '#cfd6f0',
          automations: '#a878f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Cinzel', 'Inter', 'serif'],
      },
      backgroundImage: {
        'radial-nebula':
          'radial-gradient(circle at 50% 50%, #10112a 0%, #0a0b1a 60%, #05060d 100%)',
      },
      letterSpacing: {
        widest: '0.20em',
        mystic: '0.32em',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.92' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        drift: {
          '0%': { transform: 'translate(0px, 0px)' },
          '100%': { transform: 'translate(20px, -15px)' },
        },
      },
      animation: {
        breathe: 'breathe 3.5s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}

export default config

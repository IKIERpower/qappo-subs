import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary-rgb) / <alpha-value>)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        surface: 'var(--bg-surface)',
        'surface-container-lowest': 'var(--bg-surface-container-lowest)',
        'surface-container-low': 'var(--bg-surface-container-low)',
        'surface-container': 'var(--bg-surface-container)',
        'surface-container-high': 'var(--bg-surface-container-high)',
        'surface-container-highest': 'var(--bg-surface-container-highest)',
        'on-surface': 'var(--text-on-surface)',
        'on-surface-variant': 'var(--text-on-surface-variant)',
        'outline': '#777777',
        'outline-variant': '#C6C6C6',
        'secondary-container': '#7CEAAB',
        'tertiary-container': '#D43C42',
      },
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        full: '9999px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'backdrop-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-right': 'slide-right 0.35s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'backdrop-in': 'backdrop-in 0.2s ease-out both',
        'modal-in': 'modal-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
export default config

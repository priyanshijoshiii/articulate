import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C8922A',
          dim: 'rgba(200, 146, 42, 0.15)',
          border: 'rgba(200, 146, 42, 0.3)',
        },
        ink: '#080808',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        serif: ['Playfair Display', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
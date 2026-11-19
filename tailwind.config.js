/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a12',
          900: '#0c1120',
          850: '#11182c',
          800: '#161f38',
          700: '#1e2b4d',
          600: '#2d3d6b',
        },
        brand: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          indigo: '#6366f1',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}


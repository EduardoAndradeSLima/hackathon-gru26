/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        guarulhos: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0b2a64'
        },
        civic: {
          red: '#dc2626',
          yellow: '#f59e0b',
          green: '#059669',
          ink: '#172033',
          muted: '#64748b',
          line: '#d8e0ee'
        }
      },
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        card: '8px'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};

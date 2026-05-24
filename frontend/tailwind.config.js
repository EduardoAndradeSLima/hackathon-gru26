/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        guarulhos: {
          50: '#fff9e6',
          100: '#fff1bf',
          500: '#FFD970',
          600: '#FAB748',
          700: '#2B255C',
          900: '#171236',
          green: '#95B53D',
          lime: '#1CA141',
          yellow: '#FFD970',
          amber: '#FAB748',
          orange: '#F39433',
          blue: '#3EA3DC'
        },
        civic: {
          red: '#dc2626',
          yellow: '#FAB748',
          green: '#1CA141',
          ink: '#1f1b3f',
          muted: '#64748b',
          line: '#efe6c8'
        }
      },
      boxShadow: {
        soft: '0 12px 32px rgba(43, 37, 92, 0.10)'
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

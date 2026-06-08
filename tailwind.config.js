/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#E8F3FF',
          100: '#B9D7FF',
          200: '#8ABBFF',
          300: '#5C9EFF',
          400: '#2D81FF',
          500: '#165DFF',
          600: '#0E42D2',
          700: '#0A2BA1',
          800: '#061A70',
          900: '#030D3F',
        },
        success: {
          50: '#E8FFEA',
          500: '#00B42A',
          600: '#009A29',
        },
        warning: {
          50: '#FFF7E8',
          500: '#FF7D00',
          600: '#D95A00',
        },
        danger: {
          50: '#FFECE8',
          500: '#F53F3F',
          600: '#CB2634',
        },
        neutral: {
          50: '#F7F8FA',
          100: '#F2F3F5',
          200: '#E5E6EB',
          300: '#C9CDD4',
          400: '#86909C',
          500: '#4E5969',
          600: '#272E3B',
          700: '#1D2129',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

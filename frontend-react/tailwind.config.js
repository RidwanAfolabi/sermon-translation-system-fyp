/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#101827',
          800: '#1b2430',
          700: '#283140',
        },
        slate: {
          600: '#4b5563',
        },
        primary: {
          DEFAULT: '#111827',
          dark: '#0b1220',
          soft: '#1b2430',
        },
        secondary: {
          DEFAULT: '#1f6f6d',
          dark: '#1f5f5b',
        },
        accent: {
          gold: '#c5a24a',
          sand: '#f2e6c9',
        },
        success: {
          DEFAULT: '#1f8f5f',
          light: '#e7f5ef',
        },
        warning: {
          DEFAULT: '#c87f1a',
          light: '#f8eed9',
        },
        error: {
          DEFAULT: '#b42318',
          light: '#fdecec',
        },
        live: {
          DEFAULT: '#1f8f5f',
          dark: '#16764e',
        },
        background: '#f4f1e9',
        surface: '#fffbf3',
        line: '#e5ded0',
        text: {
          primary: '#101827',
          secondary: '#4b5563',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"IBM Plex Sans"', '"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 20px rgba(16, 24, 39, 0.12)',
        'card-hover': '0 14px 30px rgba(16, 24, 39, 0.16)',
        button: '0 6px 14px rgba(16, 24, 39, 0.18)',
        'button-hover': '0 10px 22px rgba(16, 24, 39, 0.24)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

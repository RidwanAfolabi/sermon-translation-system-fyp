/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#0d7377',
          dark: '#0a5a5d',
          light: '#0d7377/10',
        },
        // Secondary / Accent colors
        accent: {
          gold: '#d4a03e',
          goldLight: '#d4a03e/10',
        },
        // Status colors
        success: {
          DEFAULT: '#28a745',
          light: '#28a745/10',
        },
        warning: {
          DEFAULT: '#ffc107',
          light: '#ffc107/10',
        },
        error: {
          DEFAULT: '#dc3545',
          light: '#dc3545/10',
        },
        live: {
          DEFAULT: '#00e676',
          dark: '#00c853',
        },
        // Background
        background: '#f8f9fa',
        // Text
        text: {
          primary: '#212529',
          secondary: '#6c757d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        button: '0 2px 4px rgba(13, 115, 119, 0.2)',
        'button-hover': '0 4px 8px rgba(13, 115, 119, 0.3)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
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

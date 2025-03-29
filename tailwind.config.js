/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Space Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        'space-dark': '#0A051C',
        'space-deep': '#1A103C',
        'space-purple': '#2D1B69',
        'space-blue': '#0D21A1',
        'space-light': '#1D39EC',
        'alien-glow': '#4AFF8C',
        'alien-bright': '#00FF66',
        'alien-dark': '#3BA872',
        'neon-pink': '#FF00E5',
        'neon-blue': '#00FFFF',
      },
      backgroundImage: {
        'nebula': "url('/images/nebula-bg.jpg')",
        'space-gradient': 'linear-gradient(to bottom, #0A051C, #1A103C)',
        'alien-gradient': 'linear-gradient(90deg, #2D1B69, #4AFF8C)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'alien-glow': '0 0 15px rgba(74, 255, 140, 0.6)',
        'neon': '0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
}
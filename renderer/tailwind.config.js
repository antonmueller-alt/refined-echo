const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      // Base colors
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      transparent: 'transparent',
      
      // KI-Theme Colors (türkis → blau → lila)
      cyan: colors.cyan,
      teal: colors.teal,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      
      // Status colors
      red: colors.red,
      green: colors.green,
      yellow: colors.yellow,
      amber: colors.amber,
    },
    extend: {
      // Glasmorphism background colors
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.05)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'glass-active': 'rgba(255, 255, 255, 0.12)',
      },
      // Glasmorphism border colors
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-strong': 'rgba(255, 255, 255, 0.2)',
      },
      // Backdrop blur
      backdropBlur: {
        'glass': '20px',
      },
      // Box shadows for glow effects
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.4)',
        'glow-cyan-strong': '0 0 30px rgba(34, 211, 238, 0.6)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-gradient': '0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-pulse': 'scale-pulse 0.8s ease-in-out infinite',
        'waveform': 'waveform 0.5s ease-in-out infinite',
        'waveform-delay-1': 'waveform 0.5s ease-in-out 0.1s infinite',
        'waveform-delay-2': 'waveform 0.5s ease-in-out 0.2s infinite',
        'waveform-delay-3': 'waveform 0.5s ease-in-out 0.3s infinite',
        'waveform-delay-4': 'waveform 0.5s ease-in-out 0.4s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.3)' },
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'waveform': {
          '0%, 100%': { height: '20%' },
          '50%': { height: '80%' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)',
          },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom Colors - The Conclave Palette
      colors: {
        // Primary Noble Colors
        'cns-gold': '#D4AF37',
        'cns-white': '#F5F5F5',
        'cns-dark': '#0A0A0F',
        
        // Pathway Colors
        'gaming-primary': '#00BFFF',
        'gaming-secondary': '#8A2BE2',
        'gaming-neon': '#00FFFF',
        
        'lorebound-primary': '#FF1493',
        'lorebound-secondary': '#9932CC',
        'lorebound-mystical': '#6A0DAD',
        
        'productive-primary': '#50C878',
        'productive-secondary': '#2E8B57',
        'productive-accent': '#3CB371',
        
        'news-primary': '#E0115F',
        'news-secondary': '#DC143C',
        'news-accent': '#FF6347',
        
        // Staff Tier Colors
        'divine-gold': '#FFD700',
        'celestial-red': '#E74C3C',
        'royal-blue': '#3498DB',
        
        // Utility Colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      
      // Custom Fonts
      fontFamily: {
        primary: ['Josefin Sans', 'sans-serif'],
        decorative: ['Cinzel Decorative', 'serif'],
        gaming: ['Orbitron', 'sans-serif'],
        mystical: ['Ring of Kerry', 'serif'],
      },
      
      // Custom Spacing
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      
      // Custom Border Radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      
      // Custom Box Shadows
      boxShadow: {
        'divine': '0 0 30px rgba(212, 175, 55, 0.5)',
        'gaming': '0 0 30px rgba(0, 191, 255, 0.5)',
        'lorebound': '0 0 30px rgba(255, 20, 147, 0.5)',
        'productive': '0 0 30px rgba(80, 200, 120, 0.5)',
        'news': '0 0 30px rgba(224, 17, 95, 0.5)',
        'glow-intense': '0 0 40px rgba(212, 175, 55, 0.8)',
        'glow-soft': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      
      // Custom Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'glass': '10px',
        'heavy': '20px',
      },
      
      // Custom Background Images
      backgroundImage: {
        'gradient-divine': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
        'gradient-gaming': 'linear-gradient(135deg, #00BFFF 0%, #8A2BE2 100%)',
        'gradient-lorebound': 'linear-gradient(135deg, #FF1493 0%, #9932CC 100%)',
        'gradient-productive': 'linear-gradient(135deg, #50C878 0%, #2E8B57 100%)',
        'gradient-news': 'linear-gradient(135deg, #E0115F 0%, #DC143C 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      // Custom Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-out': 'fadeOut 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-out': 'slideOut 0.5s ease-in',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      
      // Custom Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      
      // Custom Z-Index Scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Custom Typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Custom Container
      container: {
        center: true,
        padding: {
          DEFAULT: '1.5rem',
          sm: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '5rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
      
      // Custom Screens (Breakpoints)
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      
      // Custom Transition
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
      
      // Custom Transition Timing
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.4)',
        },
        '.text-glow-gold': {
          textShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
        },
        '.text-glow-gaming': {
          textShadow: '0 0 10px rgba(0, 191, 255, 0.8)',
        },
        '.text-glow-lorebound': {
          textShadow: '0 0 10px rgba(255, 20, 147, 0.8)',
        },
        '.backdrop-glass': {
          backdropFilter: 'blur(10px) saturate(180%)',
          WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        },
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
  // Safelist important classes that might be used dynamically
  safelist: [
    'gaming-realm',
    'lorebound-realm',
    'productive-realm',
    'news-realm',
    {
      pattern: /bg-(gaming|lorebound|productive|news)-(primary|secondary|accent)/,
    },
    {
      pattern: /text-(gaming|lorebound|productive|news)-(primary|secondary|accent)/,
    },
    {
      pattern: /border-(gaming|lorebound|productive|news)-(primary|secondary|accent)/,
    },
  ],
}
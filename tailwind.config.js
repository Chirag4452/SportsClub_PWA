/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary skating club colors
        primary: {
          50: '#eff6ff',   // Very light ice blue
          100: '#dbeafe',  // Light ice blue
          200: '#bfdbfe',  // Soft ice blue
          300: '#93c5fd',  // Medium ice blue
          400: '#60a5fa',  // Active ice blue
          500: '#3b82f6',  // Primary ice blue
          600: '#2563eb',  // Deep ice blue
          700: '#1d4ed8',  // Darker ice blue
          800: '#1e40af',  // Dark ice blue
          900: '#1e3a8a',  // Very dark ice blue
          950: '#172554',  // Deepest ice blue
        },
        secondary: {
          50: '#f8fafc',   // Very light gray (ice-like)
          100: '#f1f5f9',  // Light gray
          200: '#e2e8f0',  // Soft gray
          300: '#cbd5e1',  // Medium gray
          400: '#94a3b8',  // Active gray
          500: '#64748b',  // Primary gray
          600: '#475569',  // Deep gray
          700: '#334155',  // Darker gray
          800: '#1e293b',  // Dark gray
          900: '#0f172a',  // Very dark gray
        },
        accent: {
          50: '#fef7ff',   // Very light purple (for highlights)
          100: '#faf0fe',  // Light purple
          200: '#f3e8ff',  // Soft purple
          300: '#e9d5ff',  // Medium purple
          400: '#d8b4fe',  // Active purple
          500: '#c084fc',  // Primary purple
          600: '#a855f7',  // Deep purple
          700: '#9333ea',  // Darker purple
          800: '#7c3aed',  // Dark purple
          900: '#6b21a8',  // Very dark purple
        },
        success: {
          50: '#f0fdf4',   // Success green variations
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Primary success
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',   // Warning orange/yellow variations
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Primary warning
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',   // Error red variations
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Primary error
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        // Modern font stack optimized for sports/athletic feel
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'], // For headings and prominent text
        'mono': ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Menlo', 'Consolas', 'monospace'],
      },
      spacing: {
        // Additional spacing for mobile-optimized touch targets
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
      },
      screens: {
        // Mobile-first responsive breakpoints optimized for PWA
        'xs': '475px',    // Extra small devices
        'sm': '640px',    // Small devices (landscape phones)
        'md': '768px',    // Medium devices (tablets)
        'lg': '1024px',   // Large devices (desktops)
        'xl': '1280px',   // Extra large devices
        '2xl': '1536px',  // 2X large devices
        // Custom breakpoints for PWA optimization
        'mobile': {'max': '767px'},      // Mobile-only styles
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablet-only styles
        'desktop': {'min': '1024px'},    // Desktop and up
      },
      animation: {
        // Custom animations for smooth PWA experience
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Enhanced shadows for card-based UI
        'card': '0 2px 8px -1px rgb(0 0 0 / 0.1), 0 1px 4px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'floating': '0 10px 40px -10px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [
    // Add any additional Tailwind plugins here if needed
  ],
}

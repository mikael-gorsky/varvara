/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#E91E63',
          hover: '#F06292',
          pressed: '#C2185B',
        },
        status: {
          connected: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        'varvara-bg': {
          dark: {
            primary: '#000000',
            secondary: '#0A0A0A',
            tertiary: '#141414',
            elevated: '#1A1A1A',
            card: '#111111',
          },
          light: {
            primary: '#FFFFFF',
            secondary: '#F5F5F5',
            tertiary: '#EEEEEE',
            elevated: '#FAFAFA',
            card: '#FFFFFF',
          },
        },
        'varvara-text': {
          dark: {
            primary: '#FFFFFF',
            secondary: '#9CA3AF',
            tertiary: '#6B7280',
            disabled: '#4B5563',
          },
          light: {
            primary: '#000000',
            secondary: '#6B7280',
            tertiary: '#9CA3AF',
            disabled: '#D1D5DB',
          },
        },
        'varvara-divider': {
          dark: {
            standard: 'rgba(255, 255, 255, 0.12)',
            strong: 'rgba(255, 255, 255, 0.2)',
          },
          light: {
            standard: 'rgba(0, 0, 0, 0.08)',
            strong: 'rgba(0, 0, 0, 0.12)',
          },
        },
        'data-viz': {
          primary: '#E91E63',
          secondary: '#2979FF',
          positive: '#10B981',
          warning: '#F59E0B',
          negative: '#EF4444',
        },
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        'sidebar': '280px',
      },
      fontSize: {
        // Mobile menu - large typography (40-48px)
        'menu-mobile': ['40px', { lineHeight: '1.15', fontWeight: '300' }],
        'menu-mobile-lg': ['48px', { lineHeight: '1.15', fontWeight: '300' }],
        // Desktop menu (30-36px)
        'menu-desktop': ['30px', { lineHeight: '1.2', fontWeight: '300' }],
        'menu-desktop-lg': ['36px', { lineHeight: '1.2', fontWeight: '300' }],
        // Active menu item (bold)
        'menu-mobile-active': ['40px', { lineHeight: '1.15', fontWeight: '600' }],
        'menu-desktop-active': ['30px', { lineHeight: '1.2', fontWeight: '600' }],
        // Page titles
        'page-title': ['48px', { lineHeight: '1.1', fontWeight: '300' }],
        'page-title-mobile': ['32px', { lineHeight: '1.15', fontWeight: '300' }],
        'page-title-desktop': ['56px', { lineHeight: '1.1', fontWeight: '300' }],
        // Section headers
        'section-title': ['24px', { lineHeight: '1.2', fontWeight: '400' }],
        // KPI values
        'kpi-value': ['32px', { lineHeight: '1.1', fontWeight: '400' }],
        'kpi-value-lg': ['48px', { lineHeight: '1.1', fontWeight: '300' }],
        // Labels (uppercase, tracked)
        'label-xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.06em', fontWeight: '500' }],
        // Body text
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        // Logo
        'logo': ['18px', { lineHeight: '1', letterSpacing: '0.15em', fontWeight: '500' }],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

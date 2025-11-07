/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#E91E63',
          hover: '#F06292',
          pressed: '#C2185B',
          light: '#D81B60',
        },
        'varvara-bg': {
          dark: {
            primary: '#000000',
            secondary: '#0A0A0A',
            tertiary: '#141414',
            elevated: '#1A1A1A',
          },
          light: {
            primary: '#FFFFFF',
            secondary: '#F5F5F5',
            tertiary: '#EEEEEE',
            elevated: '#FAFAFA',
          },
        },
        'varvara-text': {
          dark: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.7)',
            tertiary: 'rgba(255, 255, 255, 0.5)',
            disabled: 'rgba(255, 255, 255, 0.3)',
          },
          light: {
            primary: '#000000',
            secondary: 'rgba(0, 0, 0, 0.7)',
            tertiary: 'rgba(0, 0, 0, 0.5)',
            disabled: 'rgba(0, 0, 0, 0.3)',
          },
        },
        'varvara-divider': {
          dark: {
            standard: 'rgba(255, 255, 255, 0.12)',
            strong: 'rgba(255, 255, 255, 0.2)',
          },
          light: {
            standard: 'rgba(0, 0, 0, 0.12)',
            strong: 'rgba(0, 0, 0, 0.2)',
          },
        },
        'varvara-surface': {
          dark: {
            1: 'rgba(255, 255, 255, 0.05)',
            2: 'rgba(255, 255, 255, 0.08)',
            3: 'rgba(255, 255, 255, 0.11)',
          },
          light: {
            1: 'rgba(0, 0, 0, 0.03)',
            2: 'rgba(0, 0, 0, 0.05)',
            3: 'rgba(0, 0, 0, 0.08)',
          },
        },
        'data-viz': {
          primary: '#E91E63',
          secondary: '#2979FF',
          positive: '#76FF03',
          warning: '#FF6F00',
          alternative: '#7C4DFF',
          negative: '#D32F2F',
        },
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '6': '48px',
        '8': '64px',
        '12': '96px',
      },
      fontSize: {
        'app-name-mobile-sm': ['48px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'app-name-mobile': ['56px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'app-name-mobile-lg': ['64px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'app-name-tablet': ['84px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'app-name-desktop': ['96px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'app-name-desktop-lg': ['108px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'app-name-desktop-xl': ['120px', { lineHeight: '1.1', letterSpacing: '0.04em', fontWeight: '300' }],
        'menu-l1': ['20px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '400' }],
        'menu-l2': ['18px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '400' }],
        'page-title-mobile': ['32px', { lineHeight: '1.2', letterSpacing: '0.03em', fontWeight: '400' }],
        'page-title-desktop': ['40px', { lineHeight: '1.2', letterSpacing: '0.03em', fontWeight: '400' }],
        'subsection': ['20px', { lineHeight: '1.3', letterSpacing: '0.03em', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'kpi-value-mobile': ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '300' }],
        'kpi-value-desktop': ['56px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '300' }],
        'label': ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '400' }],
        'label-lg': ['12px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '400' }],
        'micro': ['10px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
      },
      borderRadius: {
        none: '0px',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'ease-in-custom': 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
    },
  },
  plugins: [],
};

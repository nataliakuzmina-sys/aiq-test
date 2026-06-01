import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background
        'background-primary': 'var(--background-primary)',
        'background-display': 'var(--background-display)',
        'background-tertiary': 'var(--background-tertiary)',
        'background-tertiary-hover': 'var(--background-tertiary-hover)',
        // Accent
        'accent-primary': 'var(--accent-primary)',
        'accent-light': 'var(--accent-light)',
        // Button
        'button-primary': 'var(--button-primary)',
        'button-primary-hover': 'var(--button-primary-hover)',
        'button-primary-disabled': 'var(--button-primary-disabled)',
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-inverse': 'var(--text-inverse)',
        'text-accent': 'var(--text-accent)',
        'text-accent-hover': 'var(--text-accent-hover)',
        'text-accent-disabled': 'var(--text-accent-disabled)',
        // Border
        'border-selector': 'var(--border-selector)',
        // Selector
        'selector-primary': 'var(--selector-primary)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
      },
      screens: {
        mobile: '375px',
        tablet: '768px',
        desktop: '1440px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Family calendar custom palette
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        person: {
          // Avatar colors (7 bright, distinct hues)
          red: '#ef4444',
          orange: '#f97316',
          amber: '#eab308',
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },
      spacing: {
        // Touch-friendly defaults (min 44px tap targets)
        touch: '2.75rem',
      },
      fontSize: {
        // Readable on 10-15" touch screens from arm's length
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['2rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        // Friendly, rounded aesthetic
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        touch: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

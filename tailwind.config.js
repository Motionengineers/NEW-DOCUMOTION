/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'system-blue': 'var(--system-blue)',
        'system-green': 'var(--system-green)',
        'system-indigo': 'var(--system-indigo)',
        'system-orange': 'var(--system-orange)',
        'system-pink': 'var(--system-pink)',
        'system-purple': 'var(--system-purple)',
        'system-red': 'var(--system-red)',
        'system-teal': 'var(--system-teal)',
        'system-yellow': 'var(--system-yellow)',
        label: 'var(--label)',
        'secondary-label': 'var(--secondary-label)',
        'tertiary-label': 'var(--tertiary-label)',
        glassBg: 'rgba(255,255,255,0.06)',
        accentFrom: '#7C3AED',
        accentTo: '#EC4899',
      },
      backgroundColor: {
        'system-background': 'var(--system-background)',
        'system-secondary-background': 'var(--system-secondary-background)',
      },
      borderColor: {
        separator: 'var(--separator)',
        border: 'var(--separator)',
      },
    },
  },
  plugins: [],
};

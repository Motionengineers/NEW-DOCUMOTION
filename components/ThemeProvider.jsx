'use client';

import { useEffect, useState, createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Start with 'dark' as default for SSR, then update on mount
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);

    // Set initial theme class on document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(saved);
  }, []);

  function toggle() {
    setTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark';

      // Update localStorage
      localStorage.setItem('theme', next);

      // Update DOM class immediately
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(next);

      return next;
    });
  }

  // Always provide context, even during SSR
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

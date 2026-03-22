import { useEffect, useState } from 'react';

const storageKey = 'marketshield-theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  };
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getStorageItem, setStorageItem } from '@/services/storage/localStorageService';
import type { ThemeMode } from '@/theme';

const THEME_STORAGE_KEY = 'momentum_theme_preference';

/**
 * Get initial theme preference
 */
const getInitialTheme = (): ThemeMode => {
  try {
    // Check localStorage first
    const stored = getStorageItem<ThemeMode>(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    // Silently handle storage errors and fall back to system preference
    console.warn('Failed to read theme preference from localStorage:', error);
  }

  // Fallback to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  // Default to light
  return 'light';
};

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleLight: () => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeContext Provider
 *
 * Provides theme state and methods to all child components.
 */
export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    // Persist theme preference to localStorage
    try {
      setStorageItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // Silently handle storage errors
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLight = () => {
    setThemeState('light');
  };

  const toggleDark = () => {
    setThemeState('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, toggleLight, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 *
 * @throws Error if used outside ThemeContextProvider
 */
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ThemePreference } from '@/constants/preferences';
import { useThemeState } from './logic';

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Holds the theme preference rendered by the server so the header and settings stay in sync. */
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemePreference;
  children: ReactNode;
}) {
  const value = useThemeState(initialTheme);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

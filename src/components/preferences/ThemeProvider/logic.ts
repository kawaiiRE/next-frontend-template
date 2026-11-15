'use client';

import { useCallback, useState } from 'react';
import {
  PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  THEME_COOKIE,
  type ThemePreference,
} from '@/constants/preferences';
import { writePreferenceCookie } from '@/lib/client-cookies';
import { THEME_COLORS } from '@/styles/tokens';

/** Keeps `<meta name="theme-color">` aligned with the chosen theme (status bar / browser chrome). */
function syncThemeColorMeta(theme: ThemePreference) {
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((element) => element.remove());

  const entries =
    theme === 'system'
      ? [
          { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
          { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
        ]
      : [{ media: null, color: THEME_COLORS[theme] }];

  for (const entry of entries) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = entry.color;
    if (entry.media) meta.media = entry.media;
    document.head.appendChild(meta);
  }
}

/**
 * Applies a theme instantly: no colour transitions across the page (theme switching is frequent
 * and should feel immediate), cookie persisted so the next server render matches.
 */
export function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  root.setAttribute('data-theme-switching', '');
  root.dataset.theme = theme;
  syncThemeColorMeta(theme);
  writePreferenceCookie(THEME_COOKIE, theme, PREFERENCE_COOKIE_MAX_AGE_SECONDS);
  // Two frames: let the new colours paint before transitions are re-enabled.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute('data-theme-switching')),
  );
}

export function useThemeState(initialTheme: ThemePreference) {
  const [theme, setThemeState] = useState(initialTheme);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  return { theme, setTheme };
}

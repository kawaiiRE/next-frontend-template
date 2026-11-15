'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { THEME_PREFERENCES, type ThemePreference } from '@/constants/preferences';
import { LOCALE_NATIVE_NAMES, LOCALES, type Locale } from '@/i18n/config';

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeIcon({ theme }: { theme: ThemePreference }) {
  const Icon = THEME_ICONS[theme];
  return <Icon aria-hidden="true" />;
}

export function useThemeOptions() {
  const t = useTranslations('theme');
  return useMemo(
    () =>
      THEME_PREFERENCES.map((theme) => ({
        value: theme,
        label: t(theme),
        icon: <ThemeIcon theme={theme} />,
      })),
    [t],
  );
}

export function useLocaleOptions(): { value: Locale; label: string; lang: Locale }[] {
  return useMemo(
    () =>
      LOCALES.map((locale) => ({
        value: locale,
        label: LOCALE_NATIVE_NAMES[locale],
        lang: locale,
      })),
    [],
  );
}

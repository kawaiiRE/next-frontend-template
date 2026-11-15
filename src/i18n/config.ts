export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'locale';
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const LOCALE_DIRECTIONS: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

/** Native names are shown in the switcher so people can find their own language. */
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function localeDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_DIRECTIONS[locale];
}

/**
 * Picks the best supported locale from an Accept-Language header.
 * Quality values are honoured; region subtags fall back to their language (`ar-EG` -> `ar`).
 */
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;

  const candidates = header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const qualityParam = params.find((param) => param.trim().startsWith('q='));
      const quality = qualityParam ? Number(qualityParam.trim().slice(2)) : 1;
      return { language: tag.toLowerCase().split('-')[0] ?? '', quality, index };
    })
    .filter((candidate) => candidate.language && Number.isFinite(candidate.quality))
    .filter((candidate) => candidate.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  return candidates.map((candidate) => candidate.language).find(isLocale) ?? null;
}

export function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null) {
  if (isLocale(cookieValue)) return cookieValue;
  return matchAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

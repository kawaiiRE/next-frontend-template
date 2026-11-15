import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Providers } from '@/components/layout/Providers';
import { SkipLink } from '@/components/layout/SkipLink';
import { SITE_CONFIG } from '@/config/site';
import { NONCE_HEADER } from '@/constants/headers';
import { parseThemePreference, THEME_COOKIE } from '@/constants/preferences';
import { localeDirection } from '@/i18n/config';
import { THEME_COLORS } from '@/styles/tokens';
import { arabicFont, latinFont } from './fonts';
import '@/styles/globals.scss';

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations('metadata'), getLocale()]);
  const siteName = t('siteName');

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: { default: siteName, template: `%s · ${siteName}` },
    description: t('siteDescription'),
    applicationName: siteName,
    robots: SITE_CONFIG.indexable ? undefined : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName,
      title: siteName,
      description: t('siteDescription'),
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
    },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/** Viewport and browser chrome colour follow the stored theme so the status bar never mismatches. */
export async function generateViewport(): Promise<Viewport> {
  const theme = parseThemePreference((await cookies()).get(THEME_COOKIE)?.value);

  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content',
    colorScheme: theme === 'system' ? 'light dark' : theme,
    themeColor:
      theme === 'system'
        ? [
            { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
            { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
          ]
        : THEME_COLORS[theme],
  };
}

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const [locale, cookieStore, headerStore] = await Promise.all([getLocale(), cookies(), headers()]);
  const dir = localeDirection(locale);
  const theme = parseThemePreference(cookieStore.get(THEME_COOKIE)?.value);
  const nonce = headerStore.get(NONCE_HEADER) ?? undefined;

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      className={`${latinFont.variable} ${arabicFont.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <SkipLink />
          <Providers dir={dir} nonce={nonce} theme={theme}>
            <div className="app-root">{children}</div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

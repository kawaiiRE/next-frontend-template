import type { MetadataRoute } from 'next';
import en from '@/messages/en.json';
import { APP_ROUTES } from '@/constants/routes';
import { COLOR_TOKENS, THEME_COLORS } from '@/styles/tokens';

export default function manifest(): MetadataRoute.Manifest {
  // Requested without user context, so the default-locale copy is used.
  const meta = en.metadata;

  return {
    name: meta.siteName,
    short_name: meta.siteName,
    description: meta.siteDescription,
    start_url: APP_ROUTES.dashboard,
    scope: '/',
    display: 'standalone',
    background_color: COLOR_TOKENS.light.background,
    theme_color: THEME_COLORS.light,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  };
}

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { APP_ROUTES } from '@/constants/routes';

/** Public pages only. Empty while the site is not indexable. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_CONFIG.indexable) return [];
  return [
    { url: SITE_CONFIG.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_CONFIG.url}${APP_ROUTES.login}`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_CONFIG.url}${APP_ROUTES.register}`, changeFrequency: 'yearly', priority: 0.5 },
  ];
}

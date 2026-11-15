import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';

/** Not indexable by default; set `NEXT_PUBLIC_INDEXABLE=true` at build time for a public launch. */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_CONFIG.indexable) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/notes', '/profile', '/settings'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_CONFIG.indexable) return [];
  return [{ url: SITE_CONFIG.url, changeFrequency: 'weekly', priority: 1 }];
}

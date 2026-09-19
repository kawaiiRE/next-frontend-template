import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_CONFIG.url, changeFrequency: 'weekly', priority: 1 }];
}

/** Build-time site settings. Visible names and descriptions live in the message files. */
export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
  /** Brand mark letter shown in the logo and generated icons. */
  brandMark: 'N',
} as const;

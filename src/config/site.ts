export const SITE_CONFIG = {
  name: 'Launchframe',
  description:
    'A production-minded Next.js and PocketBase starter with explicit boundaries and a polished responsive shell.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

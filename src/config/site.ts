export const SITE_CONFIG = {
  name: 'Application',
  description: 'A clean Next.js frontend ready for a real product.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

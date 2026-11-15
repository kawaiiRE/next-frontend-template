import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';

/** Latin UI font (variable). */
export const latinFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-latin',
});

/** Arabic UI font; not preloaded so English pages don't download it. */
export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-arabic',
});

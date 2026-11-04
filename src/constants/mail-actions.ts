export const MAIL_ACTION_ROUTES: {
  page: string;
  confirm: string;
  home: string;
  privacy?: (locale: 'en' | 'ar' | 'fr') => string;
} = {
  page: '/mail-actions',
  confirm: '/api/v1/mail-actions',
  home: '/',
} as const;
export const MAIL_ACTION_TIMEOUT_MS = 15_000;

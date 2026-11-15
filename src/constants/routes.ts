/** Application page routes. The only place page paths are spelled out. */
export const APP_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  notes: '/notes',
  newNote: '/notes/new',
  note: (id: string) => `/notes/${encodeURIComponent(id)}`,
  editNote: (id: string) => `/notes/${encodeURIComponent(id)}/edit`,
  profile: '/profile',
  settings: '/settings',
  /** Route handler that clears a session the backend rejected, then continues to login. */
  sessionExpired: '/session/expired',
} as const;

export const MARKETING_ANCHORS = {
  features: '/#features',
  pricing: '/#pricing',
  faq: '/#faq',
} as const;

/** Pages that need a session. `proxy.ts` redirects early; layouts enforce it again server-side. */
export const PROTECTED_PATH_PREFIXES = [
  APP_ROUTES.dashboard,
  APP_ROUTES.notes,
  APP_ROUTES.profile,
  APP_ROUTES.settings,
] as const;

/** Pages that make no sense with a session (signed-in users go to the dashboard). */
export const SIGNED_OUT_ONLY_PATHS = [
  APP_ROUTES.login,
  APP_ROUTES.register,
  APP_ROUTES.forgotPassword,
] as const;

export const NEXT_PARAM = 'next';

/** Same-origin gateway endpoints used by browser services. */
export const API_ROUTES = {
  login: '/api/v1/auth/login',
  register: '/api/v1/auth/register',
  logout: '/api/v1/auth/logout',
  passwordReset: '/api/v1/auth/password-reset',
  passwordResetConfirm: '/api/v1/auth/password-reset/confirm',
  verifyEmail: '/api/v1/auth/verify-email',
  verificationRequest: '/api/v1/auth/verify-email/request',
  guest: '/api/v1/auth/guest',
  guestUpgrade: '/api/v1/auth/guest/upgrade',
  me: '/api/v1/me',
  mePassword: '/api/v1/me/password',
  notes: '/api/v1/notes',
  note: (id: string) => `/api/v1/notes/${encodeURIComponent(id)}`,
} as const;

/** Query flag shown as a notice on the login page after account changes. */
export const LOGIN_NOTICE_PARAM = 'notice';
export const LOGIN_NOTICES = [
  'password-changed',
  'account-deleted',
  'session-expired',
  'verification-sent',
] as const;
export type LoginNotice = (typeof LOGIN_NOTICES)[number];

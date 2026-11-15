export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export const DEFAULT_THEME: ThemePreference = 'system';
export const THEME_COOKIE = 'theme';

export const SIDEBAR_STATES = ['expanded', 'collapsed'] as const;
export type SidebarState = (typeof SIDEBAR_STATES)[number];
export const SIDEBAR_COOKIE = 'sidebar';

export const PREFERENCE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseThemePreference(value: string | undefined | null): ThemePreference {
  return THEME_PREFERENCES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

export function parseSidebarState(value: string | undefined | null): SidebarState {
  return value === 'collapsed' ? 'collapsed' : 'expanded';
}

/** Session cookie set when the guest banner is dismissed; it returns in the next browser session. */
export const GUEST_BANNER_COOKIE = 'guest-banner';
export const GUEST_BANNER_DISMISSED = 'dismissed';

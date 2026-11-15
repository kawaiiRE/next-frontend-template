/**
 * Colour values needed outside CSS (Open Graph image, web manifest, browser theme-color).
 * Each entry mirrors a custom property in `palette.scss`; a unit test keeps them identical.
 */
export const COLOR_TOKENS = {
  light: {
    background: '#f6f7fb',
    surface: '#ffffff',
    text: '#141826',
    textMuted: '#5b6377',
    primary: '#5b55e7',
    brandGradientStart: '#5b55e7',
    brandGradientEnd: '#147a87',
  },
  dark: {
    background: '#0b0d14',
    surface: '#141823',
    text: '#eef0f6',
    textMuted: '#a3abbe',
    primary: '#8b86ff',
    brandGradientStart: '#8b86ff',
    brandGradientEnd: '#34bece',
  },
} as const;

/** Maps each token above to the CSS custom property it mirrors. */
export const COLOR_TOKEN_PROPERTIES = {
  background: '--color-bg',
  surface: '--color-surface',
  text: '--color-text',
  textMuted: '--color-text-muted',
  primary: '--color-primary',
  brandGradientStart: '--color-brand-gradient-start',
  brandGradientEnd: '--color-brand-gradient-end',
} as const satisfies Record<keyof (typeof COLOR_TOKENS)['light'], `--${string}`>;

/** The browser chrome colour should match the top of the page (the topbar surface). */
export const THEME_COLORS = {
  light: COLOR_TOKENS.light.surface,
  dark: COLOR_TOKENS.dark.surface,
} as const;

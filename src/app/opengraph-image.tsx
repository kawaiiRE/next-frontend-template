import { ImageResponse } from 'next/og';
import en from '@/messages/en.json';
import { SITE_CONFIG } from '@/config/site';
import { COLOR_TOKENS } from '@/styles/tokens';

export const alt = 'Northwind';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social preview rendered at build/request time from brand tokens (English copy; Latin font). */
export default function OpenGraphImage() {
  const meta = en.metadata;
  const colors = COLOR_TOKENS.dark;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 72,
        color: colors.text,
        background: `radial-gradient(circle at 15% 15%, ${colors.primary}55, transparent 45%), radial-gradient(circle at 85% 80%, ${colors.brandGradientEnd}44, transparent 45%), ${colors.background}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 18,
            fontSize: 40,
            fontWeight: 700,
            color: colors.background,
            background: `linear-gradient(135deg, ${colors.brandGradientStart}, ${colors.brandGradientEnd})`,
          }}
        >
          {SITE_CONFIG.brandMark}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>{meta.siteName}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          {meta.titles.home}
        </div>
        <div style={{ fontSize: 30, color: colors.textMuted, maxWidth: 900 }}>
          {meta.siteDescription}
        </div>
      </div>
    </div>,
    size,
  );
}

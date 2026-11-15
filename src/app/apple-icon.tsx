import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/config/site';
import { COLOR_TOKENS } from '@/styles/tokens';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const colors = COLOR_TOKENS.light;
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontSize: 104,
        fontWeight: 700,
        color: colors.surface,
        background: `linear-gradient(135deg, ${colors.brandGradientStart}, ${colors.brandGradientEnd})`,
      }}
    >
      {SITE_CONFIG.brandMark}
    </div>,
    size,
  );
}

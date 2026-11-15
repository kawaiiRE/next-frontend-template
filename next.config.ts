import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isProduction = process.env.NODE_ENV === 'production';

const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  ...(isProduction
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  agentRules: false,
  poweredByHeader: false,
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'src/styles')],
  },
  async headers() {
    return [
      { source: '/:path*', headers: baseSecurityHeaders },
      {
        // Page CSP (with a per-request nonce) is set in `src/proxy.ts`; API responses never render HTML.
        source: '/api/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

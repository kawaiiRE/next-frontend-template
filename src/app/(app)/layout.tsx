import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import {
  GUEST_BANNER_COOKIE,
  GUEST_BANNER_DISMISSED,
  parseSidebarState,
  SIDEBAR_COOKIE,
} from '@/constants/preferences';
import { presentUserView } from '@/presenters/user';
import { getAppConfigOrFallback } from '@/server/services/config';
import { requireSession } from '@/server/session';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Authenticated area. The session is verified here even though `proxy.ts` redirects earlier. */
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const [{ user }, cookieStore, t, config] = await Promise.all([
    requireSession(),
    cookies(),
    getTranslations('guest'),
    getAppConfigOrFallback(),
  ]);
  const sidebar = parseSidebarState(cookieStore.get(SIDEBAR_COOKIE)?.value);
  const guestBannerDismissed =
    cookieStore.get(GUEST_BANNER_COOKIE)?.value === GUEST_BANNER_DISMISSED;

  return (
    <AppShell
      user={presentUserView(user, t('displayName'))}
      initialSidebar={sidebar}
      guestBannerDismissed={guestBannerDismissed}
      guestTtlHours={config.features.guestTtlHours}
    >
      {children}
    </AppShell>
  );
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CtaBand } from '@/components/marketing/CtaBand';
import { Faq } from '@/components/marketing/Faq';
import { Features } from '@/components/marketing/Features';
import { Hero } from '@/components/marketing/Hero';
import { Pricing } from '@/components/marketing/Pricing';
import { TrustStrip } from '@/components/marketing/TrustStrip';
import { APP_ROUTES } from '@/constants/routes';
import { getAppConfigOrFallback } from '@/server/services/config';
import { getSessionAuth } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return { title: { absolute: `${t('siteName')} · ${t('titles.home')}` } };
}

export default async function HomePage() {
  const [auth, config] = await Promise.all([getSessionAuth(), getAppConfigOrFallback()]);
  const primaryHref = auth
    ? APP_ROUTES.dashboard
    : config.features.registration
      ? APP_ROUTES.register
      : APP_ROUTES.login;
  const guestEnabled = !auth && config.features.guest;

  return (
    <>
      <Hero primaryHref={primaryHref} guestEnabled={guestEnabled} />
      <TrustStrip />
      <Features />
      <Pricing ctaHref={primaryHref} />
      <Faq />
      <CtaBand href={primaryHref} guestEnabled={guestEnabled} />
    </>
  );
}

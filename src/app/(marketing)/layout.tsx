import { MarketingFooter } from '@/components/layout/MarketingFooter';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { MAIN_CONTENT_ID } from '@/components/layout/SkipLink';
import { getAppConfigOrFallback } from '@/server/services/config';
import { getSessionAuth } from '@/server/session';

export default async function MarketingLayout({ children }: LayoutProps<'/'>) {
  // Cookie presence only (no backend call) decides the header CTA; the dashboard verifies it.
  const [auth, config] = await Promise.all([getSessionAuth(), getAppConfigOrFallback()]);

  return (
    <>
      <MarketingHeader signedIn={auth !== null} registrationOpen={config.features.registration} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1}>
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}

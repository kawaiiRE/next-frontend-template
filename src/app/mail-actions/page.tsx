import type { Metadata } from 'next';
import { MailActionPage } from '@/components/MailActionPage';
import { SITE_CONFIG } from '@/config/site';
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default function Page() {
  return <MailActionPage appName={SITE_CONFIG.name} />;
}

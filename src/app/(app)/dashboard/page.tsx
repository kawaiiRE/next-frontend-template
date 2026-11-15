import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { LoadError } from '@/components/feedback/LoadError';
import { ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { APP_ROUTES } from '@/constants/routes';
import { presentNoteView } from '@/presenters/note';
import { presentUserView } from '@/presenters/user';
import { getDashboardSummary } from '@/server/services/notes';
import { requireSession } from '@/server/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.titles');
  return { title: t('dashboard') };
}

export default async function DashboardPage() {
  const [{ auth, user }, t, notesT, guest] = await Promise.all([
    requireSession(),
    getTranslations('dashboard'),
    getTranslations('notes'),
    getTranslations('guest'),
  ]);
  const viewer = presentUserView(user, guest('displayName'));
  const firstName = viewer.name.split(/\s+/u)[0] || viewer.displayName;
  const summary = await getDashboardSummary(auth).catch(() => null);

  return (
    <>
      <PageHeader
        title={viewer.isGuest ? t('guestGreeting') : t('greeting', { name: firstName })}
        description={t('subtitle')}
        actions={
          <ButtonLink href={APP_ROUTES.newNote} iconStart={<Plus aria-hidden="true" />}>
            {notesT('new')}
          </ButtonLink>
        }
      />
      {summary ? (
        <DashboardOverview
          totalCount={summary.totalCount}
          activeCount={summary.activeCount}
          archivedCount={summary.archivedCount}
          recent={summary.recent.map(presentNoteView)}
        />
      ) : (
        <LoadError title={t('loadErrorTitle')} description={t('loadErrorDescription')} />
      )}
    </>
  );
}

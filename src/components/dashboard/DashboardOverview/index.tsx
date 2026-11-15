import { Archive, FileText, NotebookPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RecentNotes } from '@/components/dashboard/RecentNotes';
import { StatCard } from '@/components/dashboard/StatCard';
import type { NoteViewModel } from '@/presenters/note';
import styles from './styles.module.scss';

interface DashboardOverviewProps {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
  recent: NoteViewModel[];
}

export function DashboardOverview({
  totalCount,
  activeCount,
  archivedCount,
  recent,
}: DashboardOverviewProps) {
  const t = useTranslations('dashboard');

  return (
    <div className={styles.dashboard}>
      <section className={styles.dashboard__stats} aria-label={t('recentTitle')}>
        <StatCard label={t('stats.total')} value={totalCount} icon={<FileText />} />
        <StatCard
          label={t('stats.active')}
          value={activeCount}
          icon={<NotebookPen />}
          tone="teal"
        />
        <StatCard
          label={t('stats.archived')}
          value={archivedCount}
          icon={<Archive />}
          tone="amber"
        />
      </section>
      <RecentNotes notes={recent} />
    </div>
  );
}

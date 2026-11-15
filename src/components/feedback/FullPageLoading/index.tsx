import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import styles from './styles.module.scss';

export function FullPageLoading() {
  const t = useTranslations('common');

  return (
    <div className={styles.loading} role="status">
      <Spinner size="lg" />
      <span className={styles.loading__label}>{t('loading')}</span>
    </div>
  );
}

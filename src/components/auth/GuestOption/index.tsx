import { useTranslations } from 'next-intl';
import { GuestButton } from '@/components/auth/GuestButton';
import styles from './styles.module.scss';

/** "or continue as guest" block under the sign-in and registration forms. */
export function GuestOption() {
  const t = useTranslations('guest');

  return (
    <div className={styles.option}>
      <p className={styles.option__divider}>
        <span>{t('divider')}</span>
      </p>
      <GuestButton size="lg" fullWidth />
      <p className={styles.option__hint}>{t('hint')}</p>
    </div>
  );
}

import { ArrowLeft, Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/Logo';
import { MAIN_CONTENT_ID } from '@/components/layout/SkipLink';
import { ButtonLink } from '@/components/ui/Button';
import { APP_ROUTES } from '@/constants/routes';
import styles from './styles.module.scss';

export function NotFoundView({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('notFound');

  return (
    <div className={styles.page}>
      <header className={styles.page__header}>
        <Logo href={APP_ROUTES.home} />
      </header>
      <main className={styles.page__main} id={MAIN_CONTENT_ID} tabIndex={-1}>
        <span className={styles.page__icon} aria-hidden="true">
          <Compass />
        </span>
        <p className={styles.page__code}>{t('code')}</p>
        <h1 className={styles.page__title}>{t('title')}</h1>
        <p className={styles.page__description}>{t('description')}</p>
        <div className={styles.page__actions}>
          <ButtonLink
            href={APP_ROUTES.home}
            variant="secondary"
            iconStart={<ArrowLeft className={styles.page__arrow} aria-hidden="true" />}
          >
            {t('home')}
          </ButtonLink>
          {signedIn ? <ButtonLink href={APP_ROUTES.dashboard}>{t('dashboard')}</ButtonLink> : null}
        </div>
      </main>
    </div>
  );
}

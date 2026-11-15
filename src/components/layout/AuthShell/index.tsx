import { Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';
import { MAIN_CONTENT_ID } from '@/components/layout/SkipLink';
import { LocaleSwitcher } from '@/components/preferences/LocaleSwitcher';
import { ThemeToggle } from '@/components/preferences/ThemeToggle';
import { APP_ROUTES } from '@/constants/routes';
import styles from './styles.module.scss';

/** Split-screen layout for authentication pages: form on the start side, brand panel on the end. */
export function AuthShell({ children }: { children: ReactNode }) {
  const t = useTranslations('auth.panel');

  return (
    <div className={styles.auth}>
      <div className={styles.auth__formSide}>
        <header className={styles.auth__header}>
          <Logo href={APP_ROUTES.home} />
          <div className={styles.auth__controls}>
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </header>
        <main className={styles.auth__main} id={MAIN_CONTENT_ID} tabIndex={-1}>
          <div className={styles.auth__content}>{children}</div>
        </main>
      </div>
      <aside className={styles.auth__panel} aria-hidden="true">
        <div className={styles.auth__panelGrid} />
        <figure className={styles.auth__quote}>
          <Quote className={styles.auth__quoteIcon} />
          <blockquote>{t('quote')}</blockquote>
          <figcaption>
            <strong>{t('author')}</strong>
            <span>{t('role')}</span>
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}

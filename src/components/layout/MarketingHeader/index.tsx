import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/Logo';
import { LocaleSwitcher } from '@/components/preferences/LocaleSwitcher';
import { ThemeToggle } from '@/components/preferences/ThemeToggle';
import { ButtonLink } from '@/components/ui/Button';
import { APP_ROUTES, MARKETING_ANCHORS } from '@/constants/routes';
import styles from './styles.module.scss';

interface MarketingHeaderProps {
  signedIn: boolean;
  registrationOpen: boolean;
}

export function MarketingHeader({ signedIn, registrationOpen }: MarketingHeaderProps) {
  const t = useTranslations('marketing.nav');
  const common = useTranslations('common');

  return (
    <header className={styles.header}>
      <div className={styles.header__inner}>
        <Logo href={APP_ROUTES.home} responsive />
        <nav className={styles.header__nav} aria-label={common('appName')}>
          <a href={MARKETING_ANCHORS.features}>{t('features')}</a>
          <a href={MARKETING_ANCHORS.pricing}>{t('pricing')}</a>
          <a href={MARKETING_ANCHORS.faq}>{t('faq')}</a>
        </nav>
        <div className={styles.header__actions}>
          <ThemeToggle />
          <LocaleSwitcher />
          {signedIn ? (
            <ButtonLink
              href={APP_ROUTES.dashboard}
              size="sm"
              iconEnd={<ArrowRight className={styles.header__arrow} aria-hidden="true" />}
            >
              {common('openDashboard')}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href={APP_ROUTES.login} variant="ghost" size="sm">
                {common('signIn')}
              </ButtonLink>
              {registrationOpen ? (
                <ButtonLink
                  href={APP_ROUTES.register}
                  size="sm"
                  className={styles.header__getStarted}
                >
                  {common('getStarted')}
                </ButtonLink>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

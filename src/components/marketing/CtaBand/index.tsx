import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GuestButton } from '@/components/auth/GuestButton';
import { ButtonLink } from '@/components/ui/Button';
import styles from './styles.module.scss';

interface CtaBandProps {
  href: string;
  guestEnabled: boolean;
}

export function CtaBand({ href, guestEnabled }: CtaBandProps) {
  const t = useTranslations('marketing.cta');

  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <div className={styles.cta__panel}>
        <h2 className={styles.cta__title} id="cta-title">
          {t('title')}
        </h2>
        <p className={styles.cta__description}>{t('description')}</p>
        <div className={styles.cta__actions}>
          <ButtonLink
            href={href}
            size="lg"
            variant="secondary"
            iconEnd={<ArrowRight className={styles.cta__arrow} aria-hidden="true" />}
          >
            {t('button')}
          </ButtonLink>
          {guestEnabled ? (
            <GuestButton size="lg" variant="ghost" className={styles.cta__guest} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

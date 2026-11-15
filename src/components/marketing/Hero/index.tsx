import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GuestButton } from '@/components/auth/GuestButton';
import { ProductPreview } from '@/components/marketing/ProductPreview';
import { ButtonLink } from '@/components/ui/Button';
import { APP_ROUTES, MARKETING_ANCHORS } from '@/constants/routes';
import styles from './styles.module.scss';

interface HeroProps {
  primaryHref: string;
  /** Offer a guest session instead of the features link. */
  guestEnabled: boolean;
}

export function Hero({ primaryHref, guestEnabled }: HeroProps) {
  const t = useTranslations('marketing.hero');

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.hero__glow} aria-hidden="true" />
      <div className={styles.hero__inner}>
        <div className={styles.hero__copy}>
          <p className={styles.hero__badge}>
            <Sparkles aria-hidden="true" />
            {t('badge')}
          </p>
          <h1 className={styles.hero__title} id="hero-title">
            {t('title')}
          </h1>
          <p className={styles.hero__description}>{t('description')}</p>
          <div className={styles.hero__actions}>
            <ButtonLink
              href={primaryHref}
              size="lg"
              iconEnd={<ArrowRight className={styles.hero__arrow} aria-hidden="true" />}
            >
              {t('primaryCta')}
            </ButtonLink>
            {guestEnabled ? (
              <GuestButton size="lg" />
            ) : (
              <ButtonLink href={MARKETING_ANCHORS.features} size="lg" variant="secondary">
                {t('secondaryCta')}
              </ButtonLink>
            )}
          </div>
          {primaryHref === APP_ROUTES.register ? (
            <p className={styles.hero__note}>{t('note')}</p>
          ) : null}
        </div>
        <div className={styles.hero__preview}>
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}

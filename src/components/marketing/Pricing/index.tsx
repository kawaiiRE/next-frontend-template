import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

const PLANS = ['starter', 'pro', 'team'] as const;
const FEATURE_KEYS = ['featureOne', 'featureTwo', 'featureThree'] as const;

export function Pricing({ ctaHref }: { ctaHref: string }) {
  const t = useTranslations('marketing.pricing');

  return (
    <section className={styles.pricing} id="pricing" aria-labelledby="pricing-title">
      <SectionHeading
        id="pricing-title"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <ul className={styles.pricing__grid}>
        {PLANS.map((plan) => {
          const featured = plan === 'pro';
          return (
            <li
              key={plan}
              className={cx(styles.pricing__card, featured && styles.pricing__card_featured)}
            >
              <div className={styles.pricing__top}>
                <h3 className={styles.pricing__name}>{t(`${plan}.name`)}</h3>
                {featured ? <span className={styles.pricing__badge}>{t('popular')}</span> : null}
              </div>
              <p className={styles.pricing__price}>
                <strong dir="ltr">{t(`${plan}.price`)}</strong>
                <span>{t('perMonth')}</span>
              </p>
              <p className={styles.pricing__description}>{t(`${plan}.description`)}</p>
              <ul className={styles.pricing__features}>
                {FEATURE_KEYS.map((key) => (
                  <li key={key}>
                    <Check aria-hidden="true" />
                    {t(`${plan}.${key}`)}
                  </li>
                ))}
              </ul>
              <ButtonLink href={ctaHref} variant={featured ? 'primary' : 'secondary'} fullWidth>
                {t(`${plan}.cta`)}
              </ButtonLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

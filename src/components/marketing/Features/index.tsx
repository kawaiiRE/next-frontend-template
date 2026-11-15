import {
  Accessibility,
  Braces,
  Languages,
  PanelsTopLeft,
  ShieldCheck,
  SunMoon,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import styles from './styles.module.scss';

const FEATURES: readonly {
  key: 'auth' | 'shell' | 'i18n' | 'theme' | 'api' | 'a11y';
  icon: LucideIcon;
}[] = [
  { key: 'auth', icon: ShieldCheck },
  { key: 'shell', icon: PanelsTopLeft },
  { key: 'i18n', icon: Languages },
  { key: 'theme', icon: SunMoon },
  { key: 'api', icon: Braces },
  { key: 'a11y', icon: Accessibility },
];

export function Features() {
  const t = useTranslations('marketing.features');

  return (
    <section className={styles.features} id="features" aria-labelledby="features-title">
      <SectionHeading
        id="features-title"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <ul className={styles.features__grid}>
        {FEATURES.map(({ key, icon: Icon }) => (
          <li key={key} className={styles.features__card}>
            <span className={styles.features__icon} aria-hidden="true">
              <Icon />
            </span>
            <h3 className={styles.features__title}>{t(`${key}.title`)}</h3>
            <p className={styles.features__description}>{t(`${key}.description`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

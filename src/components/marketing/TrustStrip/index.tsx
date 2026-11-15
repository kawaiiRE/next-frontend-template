import { useTranslations } from 'next-intl';
import styles from './styles.module.scss';

/** Technology names are brand names and intentionally not translated. */
const TECHNOLOGIES = ['Next.js', 'React', 'TypeScript', 'PocketBase', 'Zod', 'Base UI'] as const;

export function TrustStrip() {
  const t = useTranslations('marketing');

  return (
    <section className={styles.trust} aria-label={t('trust')}>
      <p className={styles.trust__label}>{t('trust')}</p>
      <ul className={styles.trust__list}>
        {TECHNOLOGIES.map((name) => (
          <li key={name} lang="en" dir="ltr">
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}

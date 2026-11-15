import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/Logo';
import { APP_ROUTES, MARKETING_ANCHORS } from '@/constants/routes';
import styles from './styles.module.scss';

/** Template footer. Placeholder links point at in-page anchors until real pages exist. */
export function MarketingFooter() {
  const t = useTranslations('marketing.footer');
  const nav = useTranslations('marketing.nav');
  const format = useFormatter();
  const year = format.dateTime(new Date(), { year: 'numeric' });

  const columns = [
    {
      title: t('product'),
      links: [
        { label: nav('features'), href: MARKETING_ANCHORS.features },
        { label: nav('pricing'), href: MARKETING_ANCHORS.pricing },
        { label: nav('faq'), href: MARKETING_ANCHORS.faq },
      ],
    },
    {
      title: t('resources'),
      links: [
        { label: t('documentation'), href: MARKETING_ANCHORS.faq },
        { label: t('changelog'), href: MARKETING_ANCHORS.features },
        { label: t('status'), href: APP_ROUTES.home },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('about'), href: APP_ROUTES.home },
        { label: t('privacy'), href: APP_ROUTES.home },
        { label: t('terms'), href: APP_ROUTES.home },
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__inner}>
        <div className={styles.footer__brand}>
          <Logo href={APP_ROUTES.home} />
          <p className={styles.footer__tagline}>{t('tagline')}</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} className={styles.footer__column} aria-label={column.title}>
            <p className={styles.footer__heading}>{column.title}</p>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className={styles.footer__bottom}>
        <p>{t('rights', { year })}</p>
      </div>
    </footer>
  );
}

'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { breadcrumbsFor } from '@/constants/navigation';
import styles from './styles.module.scss';

/** Page title + trail for the topbar; on small screens only the current page shows. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('metadata.titles');
  const a11y = useTranslations('a11y');
  const crumbs = breadcrumbsFor(pathname);
  if (crumbs.length === 0) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label={a11y('breadcrumb')}>
      <ol className={styles.breadcrumbs__list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              key={crumb.href}
              className={isLast ? styles.breadcrumbs__current : styles.breadcrumbs__item}
            >
              {isLast ? (
                <span aria-current="page">{t(crumb.key)}</span>
              ) : (
                <>
                  <Link className={styles.breadcrumbs__link} href={crumb.href}>
                    {t(crumb.key)}
                  </Link>
                  <ChevronRight className={styles.breadcrumbs__separator} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { cx } from '@/lib/cx';
import { paginationRange } from './logic';
import styles from './styles.module.scss';

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

/** Link-based pagination: works without JavaScript and keeps page state in the URL. */
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  const t = useTranslations('a11y');
  const format = useFormatter();
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className={styles.pagination} aria-label={t('pagination')}>
      {hasPrevious ? (
        <Link
          className={styles.pagination__step}
          href={hrefFor(page - 1)}
          aria-label={t('previousPage')}
        >
          <ChevronLeft className={styles.pagination__chevron} aria-hidden="true" />
        </Link>
      ) : (
        <span
          className={cx(styles.pagination__step, styles.pagination__disabled)}
          aria-hidden="true"
        >
          <ChevronLeft className={styles.pagination__chevron} />
        </span>
      )}

      <ol className={styles.pagination__list}>
        {paginationRange(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <Link
                className={cx(styles.pagination__page, item === page && styles.pagination__current)}
                href={hrefFor(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={t('pageNumber', { page: format.number(item) })}
              >
                {format.number(item)}
              </Link>
            </li>
          ) : (
            <li key={item} className={styles.pagination__ellipsis} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ol>

      {hasNext ? (
        <Link
          className={styles.pagination__step}
          href={hrefFor(page + 1)}
          aria-label={t('nextPage')}
        >
          <ChevronRight className={styles.pagination__chevron} aria-hidden="true" />
        </Link>
      ) : (
        <span
          className={cx(styles.pagination__step, styles.pagination__disabled)}
          aria-hidden="true"
        >
          <ChevronRight className={styles.pagination__chevron} />
        </span>
      )}
    </nav>
  );
}

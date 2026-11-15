import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './styles.module.scss';

interface PageSkeletonProps {
  variant?: 'page' | 'list' | 'dashboard';
}

/** Route-level loading placeholder shaped like the final layout to avoid layout shift. */
export function PageSkeleton({ variant = 'page' }: PageSkeletonProps) {
  const t = useTranslations('a11y');

  return (
    <div
      className={styles.skeleton}
      role="status"
      aria-busy="true"
      aria-label={t('loadingContent')}
    >
      <div className={styles.skeleton__header}>
        <Skeleton inlineSize="14rem" blockSize="2rem" />
        <Skeleton inlineSize="22rem" blockSize="1rem" />
      </div>
      {variant === 'dashboard' ? (
        <div className={styles.skeleton__stats}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} blockSize="6.5rem" radius="md" />
          ))}
        </div>
      ) : null}
      {variant === 'list' ? <Skeleton inlineSize="100%" blockSize="2.75rem" radius="md" /> : null}
      <div className={styles.skeleton__rows}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} blockSize={variant === 'page' ? '8rem' : '5.5rem'} radius="md" />
        ))}
      </div>
    </div>
  );
}

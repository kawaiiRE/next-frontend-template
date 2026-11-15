import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  headingLevel?: 'h2' | 'h3';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
  headingLevel: Heading = 'h2',
}: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, compact && styles.empty_compact)}>
      {icon ? (
        <span className={styles.empty__icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <Heading className={styles.empty__title}>{title}</Heading>
      {description ? <p className={styles.empty__description}>{description}</p> : null}
      {action ? <div className={styles.empty__action}>{action}</div> : null}
    </div>
  );
}

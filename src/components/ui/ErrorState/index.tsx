'use client';

import { CircleAlert, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface ErrorStateProps {
  title: string;
  description?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  action?: ReactNode;
  fullPage?: boolean;
  headingLevel?: 'h1' | 'h2';
}

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  action,
  fullPage,
  headingLevel: Heading = 'h2',
}: ErrorStateProps) {
  return (
    <div className={cx(styles.error, fullPage && styles.error_fullPage)} role="alert">
      <span className={styles.error__icon} aria-hidden="true">
        <CircleAlert />
      </span>
      <Heading className={styles.error__title}>{title}</Heading>
      {description ? <p className={styles.error__description}>{description}</p> : null}
      <div className={styles.error__actions}>
        {onRetry && retryLabel ? (
          <Button
            variant="secondary"
            iconStart={<RefreshCw aria-hidden="true" />}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}

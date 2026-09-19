'use client';

import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section className={styles.error}>
      <h1 className={styles.error__title}>{COPY.error.title}</h1>
      <p className={styles.error__description}>{COPY.error.description}</p>
      <button className={styles.error__button} type="button" onClick={onRetry}>
        {COPY.error.retry}
      </button>
    </section>
  );
}

'use client';

import { COPY } from '@/content/copy';
import { useHealthStatus } from './logic';
import styles from './styles.module.scss';

export function HealthStatus() {
  const { state, refresh } = useHealthStatus();
  const isAvailable = state.status === 'available';

  return (
    <article className={styles.health} aria-live="polite">
      <div className={styles.health__heading}>
        <h2 className={styles.health__title}>{COPY.health.title}</h2>
        <span
          className={isAvailable ? styles.health__indicatorAvailable : styles.health__indicator}
          aria-hidden="true"
        />
      </div>

      <p className={styles.health__message}>
        {state.status === 'loading'
          ? COPY.health.loading
          : isAvailable
            ? COPY.health.available
            : COPY.health.unavailable}
      </p>

      {isAvailable ? (
        <p className={styles.health__metadata}>
          {state.data.service} · API v{state.data.apiVersion} · {state.data.checkedAt}
        </p>
      ) : null}

      {state.status === 'unavailable' ? (
        <button className={styles.health__button} type="button" onClick={() => void refresh()}>
          {COPY.health.retry}
        </button>
      ) : null}
    </article>
  );
}

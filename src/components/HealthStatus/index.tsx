'use client';

import { COPY } from '@/content/copy';
import { useHealthStatus } from './logic';
import styles from './styles.module.scss';

export function HealthStatus() {
  const { state, refresh } = useHealthStatus();
  const isAvailable = state.status === 'available';

  return (
    <article className={styles.health} aria-live="polite">
      <div className={styles.health__content}>
        <div className={styles.health__icon} aria-hidden="true">
          <span
            className={isAvailable ? styles.health__indicatorAvailable : styles.health__indicator}
          />
          <svg viewBox="0 0 24 24">
            <path d="M4 12h4l2-5 4 10 2-5h4" />
          </svg>
        </div>
        <div>
          <h3 className={styles.health__title}>{COPY.health.title}</h3>
          <p className={styles.health__message}>
            {state.status === 'loading'
              ? COPY.health.loading
              : isAvailable
                ? COPY.health.available
                : COPY.health.unavailable}
          </p>
        </div>
      </div>

      <div className={styles.health__details}>
        <div>
          <span>{COPY.health.endpointLabel}</span>
          <code>{COPY.health.endpoint}</code>
        </div>
        {isAvailable ? (
          <div>
            <span>Verified response</span>
            <p className={styles.health__metadata}>
              {state.data.service} · API v{state.data.apiVersion} · {state.data.checkedAt}
            </p>
          </div>
        ) : null}
        {state.status === 'unavailable' ? (
          <button className={styles.health__button} type="button" onClick={() => void refresh()}>
            {COPY.health.retry}
          </button>
        ) : null}
      </div>
    </article>
  );
}

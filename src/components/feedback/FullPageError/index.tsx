'use client';

import ar from '@/messages/ar.json';
import en from '@/messages/en.json';
import styles from './styles.module.scss';

/**
 * Used by `global-error.tsx`, which replaces the root layout: no i18n or theme providers exist,
 * so both languages are rendered from the message files directly.
 */
export function FullPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className={styles.globalError}>
      <section lang="en" dir="ltr">
        <h1>{en.errorPage.title}</h1>
        <p>{en.errorPage.description}</p>
      </section>
      <section lang="ar" dir="rtl">
        <h2>{ar.errorPage.title}</h2>
        <p>{ar.errorPage.description}</p>
      </section>
      <button type="button" onClick={onRetry}>
        {en.errorPage.retry} · <span lang="ar">{ar.errorPage.retry}</span>
      </button>
    </main>
  );
}

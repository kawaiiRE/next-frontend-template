import { useTranslations } from 'next-intl';
import styles from './styles.module.scss';

export const MAIN_CONTENT_ID = 'main-content';

/** First focusable element on every page; every layout renders `<main id={MAIN_CONTENT_ID}>`. */
export function SkipLink() {
  const t = useTranslations('a11y');
  return (
    <a className={styles.skipLink} href={`#${MAIN_CONTENT_ID}`}>
      {t('skipToContent')}
    </a>
  );
}

import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footer__copy}>{COPY.footer}</p>
      <p className={styles.footer__status}>
        <span aria-hidden="true" />
        {COPY.footerStatus}
      </p>
    </footer>
  );
}

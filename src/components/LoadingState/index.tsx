import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

export function LoadingState() {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.loading__indicator} aria-hidden="true" />
      <span>{COPY.loading}</span>
    </div>
  );
}

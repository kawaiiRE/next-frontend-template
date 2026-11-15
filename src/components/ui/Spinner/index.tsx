import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label; omit when a surrounding element already announces the busy state. */
  label?: string;
  className?: string;
}

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  return (
    <span
      className={cx(styles.spinner, styles[`spinner_${size}`], className)}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 24 24" fill="none">
        <circle className={styles.spinner__track} cx="12" cy="12" r="9" />
        <path className={styles.spinner__arc} d="M21 12a9 9 0 0 0-9-9" />
      </svg>
    </span>
  );
}

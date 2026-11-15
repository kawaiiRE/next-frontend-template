import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface AlertProps {
  tone?: 'info' | 'success' | 'danger';
  title?: string;
  children: ReactNode;
  /** Announce politely when the alert appears after an action. */
  live?: boolean;
}

const ICONS = { info: Info, success: CircleCheck, danger: CircleAlert } as const;

export function Alert({ tone = 'info', title, children, live = false }: AlertProps) {
  const Icon = ICONS[tone];
  return (
    <div
      className={cx(styles.alert, styles[`alert_${tone}`])}
      role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined}
    >
      <Icon className={styles.alert__icon} aria-hidden="true" />
      <div className={styles.alert__body}>
        {title ? <p className={styles.alert__title}>{title}</p> : null}
        <div className={styles.alert__content}>{children}</div>
      </div>
    </div>
  );
}

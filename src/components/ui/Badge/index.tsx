import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface BadgeProps {
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[`badge_${tone}`], className)}>
      {icon}
      {children}
    </span>
  );
}

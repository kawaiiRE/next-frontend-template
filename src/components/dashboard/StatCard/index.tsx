import type { ReactNode } from 'react';
import { useFormatter } from 'next-intl';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: 'primary' | 'teal' | 'amber';
}

export function StatCard({ label, value, icon, tone = 'primary' }: StatCardProps) {
  const format = useFormatter();

  return (
    <article className={styles.stat}>
      <div className={styles.stat__top}>
        <p className={styles.stat__label}>{label}</p>
        <span className={cx(styles.stat__icon, styles[`stat__icon_${tone}`])} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className={styles.stat__value}>{format.number(value, 'integer')}</p>
    </article>
  );
}

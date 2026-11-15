import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface StackProps {
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

/** Vertical rhythm for page sections. */
export function Stack({ gap = 'md', children }: StackProps) {
  return <div className={cx(styles.stack, styles[`stack_${gap}`])}>{children}</div>;
}

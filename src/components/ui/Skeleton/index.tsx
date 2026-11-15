import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface SkeletonProps {
  inlineSize?: string;
  blockSize?: string;
  radius?: 'sm' | 'md' | 'full';
  className?: string;
}

/** Decorative placeholder; wrap groups in an element with `aria-busy` and a status label. */
export function Skeleton({
  inlineSize = '100%',
  blockSize = '1rem',
  radius = 'sm',
  className,
}: SkeletonProps) {
  const style: CSSProperties = { inlineSize, blockSize };
  return (
    <span
      className={cx(styles.skeleton, styles[`skeleton_${radius}`], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

import { UserRound } from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface AvatarProps {
  /** Precomputed grapheme-safe initials; `null` renders a neutral icon. */
  initials: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Decorative by default: pair it with visible text (name/email) for the accessible name. */
export function Avatar({ initials, size = 'md', className }: AvatarProps) {
  return (
    <span className={cx(styles.avatar, styles[`avatar_${size}`], className)} aria-hidden="true">
      {initials ?? <UserRound />}
    </span>
  );
}

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SITE_CONFIG } from '@/config/site';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface LogoProps {
  href: string;
  /** Hide the wordmark (collapsed sidebar); the link keeps an accessible name. */
  compact?: boolean;
  /** Visually hide the wordmark on narrow screens (crowded headers); it stays readable to AT. */
  responsive?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function Logo({
  href,
  compact = false,
  responsive = false,
  onNavigate,
  className,
}: LogoProps) {
  const t = useTranslations('common');

  return (
    <Link
      href={href}
      className={cx(styles.logo, className)}
      onClick={onNavigate}
      aria-label={compact ? t('appName') : undefined}
    >
      <span className={styles.logo__mark} aria-hidden="true">
        {SITE_CONFIG.brandMark}
      </span>
      {compact ? null : (
        <span className={cx(styles.logo__name, responsive && styles.logo__name_responsive)}>
          {t('appName')}
        </span>
      )}
    </Link>
  );
}

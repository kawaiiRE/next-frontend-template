'use client';

import { Clock, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useGuestBanner } from './logic';
import styles from './styles.module.scss';

interface GuestBannerProps {
  initiallyDismissed: boolean;
  /** Guest data lifetime from `GET /api/v1/config`. */
  ttlHours: number;
  onCreateAccount: () => void;
}

/** Reminds guests that their data is temporary and offers the upgrade. */
export function GuestBanner({ initiallyDismissed, ttlHours, onCreateAccount }: GuestBannerProps) {
  const t = useTranslations('guest');
  const { dismissed, dismiss } = useGuestBanner(initiallyDismissed);
  if (dismissed) return null;

  return (
    <section className={styles.banner} aria-label={t('bannerLabel')}>
      <div className={styles.banner__inner}>
        <Clock className={styles.banner__icon} aria-hidden="true" />
        <p className={styles.banner__text}>
          {ttlHours >= 1
            ? t('banner', { hours: ttlHours })
            : t('bannerMinutes', { minutes: Math.max(1, Math.round(ttlHours * 60)) })}
        </p>
        <div className={styles.banner__actions}>
          <Button size="sm" onClick={onCreateAccount}>
            {t('createAccount')}
          </Button>
          <IconButton
            label={t('dismiss')}
            icon={<X aria-hidden="true" />}
            size="sm"
            onClick={dismiss}
          />
        </div>
      </div>
    </section>
  );
}

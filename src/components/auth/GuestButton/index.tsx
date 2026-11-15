'use client';

import { UserRoundPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useGuestSession } from './logic';

interface GuestButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Starts a temporary guest session; only rendered when the backend enables guests. */
export function GuestButton({
  variant = 'secondary',
  size,
  fullWidth,
  className,
}: GuestButtonProps) {
  const t = useTranslations('guest');
  const { start, pending } = useGuestSession();

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      loading={pending}
      iconStart={<UserRoundPlus aria-hidden="true" />}
      onClick={() => void start()}
    >
      {pending ? t('continuing') : t('continue')}
    </Button>
  );
}

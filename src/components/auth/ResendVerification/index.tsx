'use client';

import { MailPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useResendVerification } from './logic';

interface ResendVerificationProps {
  email: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** Sends a new verification email; the response never reveals whether the account exists. */
export function ResendVerification({ email, ...buttonProps }: ResendVerificationProps) {
  const t = useTranslations('auth.verify');
  const { resend, pending } = useResendVerification(email);

  return (
    <Button
      {...buttonProps}
      loading={pending}
      iconStart={<MailPlus aria-hidden="true" />}
      onClick={() => void resend()}
    >
      {t('resend')}
    </Button>
  );
}

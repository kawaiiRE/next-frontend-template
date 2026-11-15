'use client';

import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { AccountFields } from '@/components/auth/AccountFields';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResendVerification } from '@/components/auth/ResendVerification';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { Stack } from '@/components/ui/Stack';
import { APP_ROUTES } from '@/constants/routes';
import { useRegisterForm } from './logic';

interface RegisterFormProps {
  footer: ReactNode;
  /** Rendered below the form (e.g. the guest option). */
  children?: ReactNode;
}

export function RegisterForm({ footer, children }: RegisterFormProps) {
  const t = useTranslations('auth');
  const { handleSubmit, fieldErrors, formError, pending, verificationEmail } = useRegisterForm();

  if (verificationEmail) {
    return (
      <AuthCard
        icon={<MailCheck />}
        title={t('verificationRequired.title')}
        subtitle={t('verificationRequired.description', { email: verificationEmail })}
      >
        <Stack gap="sm">
          <ButtonLink href={APP_ROUTES.login} size="lg" fullWidth>
            {t('register.signIn')}
          </ButtonLink>
          <ResendVerification email={verificationEmail} variant="ghost" size="lg" fullWidth />
        </Stack>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t('register.title')} subtitle={t('register.subtitle')} footer={footer}>
      <Form onSubmit={handleSubmit}>
        {formError ? (
          <Alert tone="danger" live>
            {formError}
          </Alert>
        ) : null}
        <AccountFields idPrefix="register" fieldErrors={fieldErrors} />
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? t('register.submitting') : t('register.submit')}
        </Button>
      </Form>
      {children}
    </AuthCard>
  );
}

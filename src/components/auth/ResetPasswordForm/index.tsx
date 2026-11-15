'use client';

import { CircleCheck, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthCard } from '@/components/auth/AuthCard';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { PasswordField } from '@/components/ui/TextField';
import { APP_ROUTES } from '@/constants/routes';
import { useResetPasswordForm } from './logic';

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('auth');
  const { handleSubmit, fieldErrors, formError, pending, done } = useResetPasswordForm(token);

  if (done) {
    return (
      <AuthCard
        icon={<CircleCheck />}
        title={t('reset.successTitle')}
        subtitle={t('reset.successDescription')}
      >
        <ButtonLink href={APP_ROUTES.login} size="lg" fullWidth>
          {t('login.submit')}
        </ButtonLink>
      </AuthCard>
    );
  }

  const tokenError = fieldErrors.token;

  return (
    <AuthCard icon={<LockKeyhole />} title={t('reset.title')} subtitle={t('reset.subtitle')}>
      <Form onSubmit={handleSubmit}>
        {formError || tokenError ? (
          <Alert tone="danger" live>
            {tokenError ?? formError}
            {tokenError ? (
              <>
                {' '}
                <a href={APP_ROUTES.forgotPassword}>{t('reset.requestNew')}</a>
              </>
            ) : null}
          </Alert>
        ) : null}
        <PasswordField
          label={t('fields.newPassword')}
          name="password"
          id="new-password"
          autoComplete="new-password"
          enterKeyHint="go"
          required
          help={t('fields.passwordHint')}
          error={fieldErrors.password}
        />
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? t('reset.submitting') : t('reset.submit')}
        </Button>
      </Form>
    </AuthCard>
  );
}

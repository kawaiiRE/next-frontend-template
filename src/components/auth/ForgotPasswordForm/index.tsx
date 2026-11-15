'use client';

import { ArrowLeft, KeyRound, Mail, MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthCard } from '@/components/auth/AuthCard';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { TextField } from '@/components/ui/TextField';
import { APP_ROUTES } from '@/constants/routes';
import { useForgotPasswordForm } from './logic';
import styles from './styles.module.scss';

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgot');
  const fields = useTranslations('auth.fields');
  const { handleSubmit, fieldErrors, formError, pending, sentTo } = useForgotPasswordForm();
  const back = (
    <ButtonLink
      href={APP_ROUTES.login}
      variant="ghost"
      iconStart={<ArrowLeft className={styles.backIcon} aria-hidden="true" />}
    >
      {t('back')}
    </ButtonLink>
  );

  if (sentTo) {
    return (
      <AuthCard
        icon={<MailCheck />}
        title={t('sentTitle')}
        subtitle={t('sentDescription', { email: sentTo })}
        footer={back}
      />
    );
  }

  return (
    <AuthCard icon={<KeyRound />} title={t('title')} subtitle={t('subtitle')} footer={back}>
      <Form onSubmit={handleSubmit}>
        {formError ? (
          <Alert tone="danger" live>
            {formError}
          </Alert>
        ) : null}
        <TextField
          label={fields('email')}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          iconStart={<Mail />}
          required
          error={fieldErrors.email}
        />
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {pending ? t('submitting') : t('submit')}
        </Button>
      </Form>
    </AuthCard>
  );
}

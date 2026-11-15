'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ResendVerification } from '@/components/auth/ResendVerification';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { PasswordField, TextField } from '@/components/ui/TextField';
import { APP_ROUTES } from '@/constants/routes';
import { useLoginForm } from './logic';
import styles from './styles.module.scss';

interface LoginFormProps {
  next: string | null;
  notice: { tone: 'info' | 'success'; message: string } | null;
}

export function LoginForm({ next, notice }: LoginFormProps) {
  const t = useTranslations('auth');
  const { handleSubmit, fieldErrors, formError, pending, unverifiedEmail } = useLoginForm(next);

  return (
    <Form onSubmit={handleSubmit}>
      {notice ? <Alert tone={notice.tone}>{notice.message}</Alert> : null}
      {formError ? (
        <Alert tone="danger" live>
          {formError}
          {unverifiedEmail ? (
            <div className={styles.form__resend}>
              <ResendVerification email={unverifiedEmail} variant="secondary" size="sm" />
            </div>
          ) : null}
        </Alert>
      ) : null}
      <TextField
        label={t('fields.email')}
        name="email"
        id="login-email"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        iconStart={<Mail />}
        required
        error={fieldErrors.email}
      />
      <div className={styles.form__password}>
        <PasswordField
          label={t('fields.password')}
          name="password"
          id="login-password"
          autoComplete="current-password"
          enterKeyHint="go"
          required
          error={fieldErrors.password}
        />
        <Link className={styles.form__forgot} href={APP_ROUTES.forgotPassword}>
          {t('login.forgot')}
        </Link>
      </div>
      <Button type="submit" size="lg" fullWidth loading={pending}>
        {pending ? t('login.submitting') : t('login.submit')}
      </Button>
    </Form>
  );
}

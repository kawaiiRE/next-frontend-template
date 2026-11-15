'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Form, FormActions } from '@/components/ui/Form';
import { PasswordField } from '@/components/ui/TextField';
import { useChangePasswordForm } from './logic';

export function ChangePasswordForm() {
  const t = useTranslations('settings');
  const fields = useTranslations('auth.fields');
  const { handleSubmit, fieldErrors, formError, pending } = useChangePasswordForm();

  return (
    <Form onSubmit={handleSubmit}>
      {formError ? (
        <Alert tone="danger" live>
          {formError}
        </Alert>
      ) : null}
      <PasswordField
        label={fields('currentPassword')}
        name="currentPassword"
        id="current-password"
        autoComplete="current-password"
        enterKeyHint="next"
        required
        error={fieldErrors.currentPassword}
      />
      <PasswordField
        label={fields('newPassword')}
        name="password"
        id="new-password"
        autoComplete="new-password"
        enterKeyHint="done"
        required
        help={fields('passwordHint')}
        error={fieldErrors.password}
      />
      <FormActions>
        <Button type="submit" variant="secondary" loading={pending}>
          {pending ? t('passwordSubmitting') : t('passwordSubmit')}
        </Button>
      </FormActions>
    </Form>
  );
}

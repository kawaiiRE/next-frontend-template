'use client';

import { useTranslations } from 'next-intl';
import { AccountFields } from '@/components/auth/AccountFields';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Form, FormActions } from '@/components/ui/Form';
import { useGuestUpgradeForm } from './logic';

interface GuestUpgradeFormProps {
  idPrefix: string;
  onUpgraded?: () => void;
}

export function GuestUpgradeForm({ idPrefix, onUpgraded }: GuestUpgradeFormProps) {
  const t = useTranslations('guest');
  const { handleSubmit, fieldErrors, formError, pending } = useGuestUpgradeForm(onUpgraded);

  return (
    <Form onSubmit={handleSubmit}>
      {formError ? (
        <Alert tone="danger" live>
          {formError}
        </Alert>
      ) : null}
      <AccountFields idPrefix={idPrefix} fieldErrors={fieldErrors} />
      <FormActions>
        <Button type="submit" loading={pending}>
          {pending ? t('upgradeSubmitting') : t('upgradeSubmit')}
        </Button>
      </FormActions>
    </Form>
  );
}

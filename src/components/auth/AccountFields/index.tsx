'use client';

import { useTranslations } from 'next-intl';
import { PasswordField, TextField } from '@/components/ui/TextField';
import { NAME_MAX_LENGTH } from '@/contracts/user';
import type { FieldMessages } from '@/hooks/use-api-form';

interface AccountFieldsProps {
  idPrefix: string;
  fieldErrors: FieldMessages;
}

/** Name, email and new-password fields shared by registration and the guest upgrade. */
export function AccountFields({ idPrefix, fieldErrors }: AccountFieldsProps) {
  const t = useTranslations('auth.fields');

  return (
    <>
      <TextField
        label={t('name')}
        name="name"
        id={`${idPrefix}-name`}
        autoComplete="name"
        maxLength={NAME_MAX_LENGTH}
        enterKeyHint="next"
        required
        error={fieldErrors.name}
      />
      <TextField
        label={t('email')}
        name="email"
        id={`${idPrefix}-email`}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        required
        error={fieldErrors.email}
      />
      <PasswordField
        label={t('password')}
        name="password"
        id={`${idPrefix}-password`}
        autoComplete="new-password"
        enterKeyHint="go"
        required
        help={t('passwordHint')}
        error={fieldErrors.password}
      />
    </>
  );
}

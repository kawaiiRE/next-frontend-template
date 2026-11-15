'use client';

import { LogOut, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteAccount } from './logic';

interface DeleteAccountProps {
  email: string;
  isGuest: boolean;
}

/**
 * Irreversible: a regular account requires typing its email before the confirm button enables.
 * Guests have no meaningful email, so ending a guest session only needs the confirmation.
 */
export function DeleteAccount({ email, isGuest }: DeleteAccountProps) {
  const t = useTranslations('settings');
  const guest = useTranslations('guest');
  const { open, setOpen, confirm } = useDeleteAccount(isGuest);

  return (
    <>
      <Button
        variant="danger"
        iconStart={isGuest ? <LogOut aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
        onClick={() => setOpen(true)}
      >
        {isGuest ? guest('endButton') : t('dangerButton')}
      </Button>
      {isGuest ? (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={guest('endDialogTitle')}
          description={guest('endDialogDescription')}
          confirmLabel={guest('endConfirm')}
          pendingLabel={guest('ending')}
          onConfirm={confirm}
        />
      ) : (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={t('dangerDialogTitle')}
          description={t('dangerDialogDescription')}
          confirmLabel={t('dangerConfirm')}
          pendingLabel={t('dangerDeleting')}
          confirmationText={email}
          confirmationLabel={t('dangerConfirmLabel', { email })}
          onConfirm={confirm}
        />
      )}
    </>
  );
}

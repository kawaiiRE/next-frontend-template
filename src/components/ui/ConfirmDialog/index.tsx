'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import dialogStyles from '@/components/ui/Dialog/styles.module.scss';
import { useConfirmDialog } from './logic';
import styles from './styles.module.scss';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  tone?: 'danger' | 'primary';
  /** Resolve `true` to close the dialog, `false` to keep it open (e.g. on error). */
  onConfirm: () => Promise<boolean>;
  /** When set, the confirm button stays disabled until this exact text is typed. */
  confirmationText?: string;
  confirmationLabel?: string;
}

/**
 * Alert dialog for irreversible actions. Initial focus lands on Cancel (the least destructive
 * option), per the WAI-ARIA alert dialog pattern.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  tone = 'danger',
  onConfirm,
  confirmationText,
  confirmationLabel,
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const { pending, typed, setTyped, canConfirm, cancelRef, handleConfirm, handleOpenChange } =
    useConfirmDialog({ onConfirm, onOpenChange, confirmationText });

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={dialogStyles.backdrop} />
        <AlertDialog.Viewport className={dialogStyles.viewport}>
          <AlertDialog.Popup className={dialogStyles.popup} initialFocus={cancelRef}>
            <AlertDialog.Title className={dialogStyles.popup__title}>{title}</AlertDialog.Title>
            <AlertDialog.Description className={dialogStyles.popup__description}>
              {description}
            </AlertDialog.Description>
            {confirmationText ? (
              <div className={styles.confirm__field}>
                <TextField
                  name="confirmation"
                  label={confirmationLabel ?? confirmationText}
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                />
              </div>
            ) : null}
            <div className={dialogStyles.popup__footer}>
              <AlertDialog.Close
                render={
                  <Button ref={cancelRef} variant="secondary" disabled={pending}>
                    {t('cancel')}
                  </Button>
                }
              />
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                loading={pending}
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                {pending && pendingLabel ? pendingLabel : confirmLabel}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

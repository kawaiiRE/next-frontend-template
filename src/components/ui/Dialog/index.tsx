'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

/**
 * Modal dialog built on Base UI: focus trap, Escape, scroll lock, outside press and focus return
 * are handled by the primitive. Stays centred (modals are not anchored to a trigger).
 */
export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  const t = useTranslations('common');

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.viewport}>
          <BaseDialog.Popup className={styles.popup}>
            <div className={styles.popup__header}>
              <BaseDialog.Title className={styles.popup__title}>{title}</BaseDialog.Title>
              <BaseDialog.Close className={styles.popup__close} aria-label={t('close')}>
                <X aria-hidden="true" />
              </BaseDialog.Close>
            </div>
            {description ? (
              <BaseDialog.Description className={styles.popup__description}>
                {description}
              </BaseDialog.Description>
            ) : null}
            <div className={styles.popup__body}>{children}</div>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

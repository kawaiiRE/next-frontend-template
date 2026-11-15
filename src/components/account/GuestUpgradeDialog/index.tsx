'use client';

import { useTranslations } from 'next-intl';
import { GuestUpgradeForm } from '@/components/account/GuestUpgradeForm';
import { Dialog } from '@/components/ui/Dialog';

interface GuestUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestUpgradeDialog({ open, onOpenChange }: GuestUpgradeDialogProps) {
  const t = useTranslations('guest');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('upgradeTitle')}
      description={t('upgradeDescription')}
    >
      <GuestUpgradeForm idPrefix="guest-upgrade" onUpgraded={() => onOpenChange(false)} />
    </Dialog>
  );
}

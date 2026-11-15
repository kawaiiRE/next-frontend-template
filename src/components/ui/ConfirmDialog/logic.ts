'use client';

import { useCallback, useRef, useState } from 'react';

interface Options {
  onConfirm: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  confirmationText?: string;
}

export function useConfirmDialog({ onConfirm, onOpenChange, confirmationText }: Options) {
  const [pending, setPending] = useState(false);
  const [typed, setTyped] = useState('');
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const canConfirm = !pending && (!confirmationText || typed.trim() === confirmationText.trim());

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (pending) return;
      if (!open) setTyped('');
      onOpenChange(open);
    },
    [onOpenChange, pending],
  );

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return;
    setPending(true);
    try {
      const shouldClose = await onConfirm();
      if (shouldClose) {
        setTyped('');
        onOpenChange(false);
      }
    } finally {
      setPending(false);
    }
  }, [canConfirm, onConfirm, onOpenChange]);

  return { pending, typed, setTyped, canConfirm, cancelRef, handleConfirm, handleOpenChange };
}

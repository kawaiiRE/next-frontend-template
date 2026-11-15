'use client';

import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Toaster as SonnerToaster } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import styles from './styles.module.scss';

interface ToasterProps {
  dir: 'ltr' | 'rtl';
}

/**
 * Sonner toaster themed with design tokens. Toasts live in an `aria-live` region, pause on hover
 * and when the tab is hidden, and can be swiped away.
 */
export function Toaster({ dir }: ToasterProps) {
  const t = useTranslations('a11y');
  const common = useTranslations('common');

  return (
    <SonnerToaster
      dir={dir}
      position={dir === 'rtl' ? 'bottom-left' : 'bottom-right'}
      className={styles.toaster}
      containerAriaLabel={t('notifications')}
      closeButton
      gap={10}
      offset={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      mobileOffset={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      icons={{
        success: <CircleCheck aria-hidden="true" />,
        error: <CircleAlert aria-hidden="true" />,
        info: <Info aria-hidden="true" />,
        warning: <TriangleAlert aria-hidden="true" />,
        loading: <Spinner size="sm" />,
        close: <X aria-hidden="true" />,
      }}
      toastOptions={{
        closeButtonAriaLabel: common('close'),
        classNames: {
          toast: styles.toast,
          title: styles.toast__title,
          description: styles.toast__description,
          icon: styles.toast__icon,
          closeButton: styles.toast__close,
          success: styles.toast_success,
          error: styles.toast_error,
        },
      }}
    />
  );
}

export { toast } from 'sonner';

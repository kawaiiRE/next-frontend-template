'use client';

import { Drawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { SidebarNav } from '@/components/layout/Sidebar';
import { localeDirection } from '@/i18n/config';
import styles from './styles.module.scss';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Off-canvas navigation for small screens. Base UI's Drawer provides the modal behaviour: focus
 * trap, Escape, outside press, body scroll lock, focus return and swipe-to-dismiss toward the
 * inline-start edge.
 */
export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const t = useTranslations('a11y');
  const rtl = localeDirection(useLocale()) === 'rtl';

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      swipeDirection={rtl ? 'right' : 'left'}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.backdrop} />
        <Drawer.Viewport className={styles.viewport}>
          <Drawer.Popup className={styles.popup} aria-label={t('mainNavigation')}>
            <Drawer.Title className={styles.title}>{t('mainNavigation')}</Drawer.Title>
            <Drawer.Close className={styles.close} aria-label={t('closeNavigation')}>
              <X aria-hidden="true" />
            </Drawer.Close>
            <SidebarNav onNavigate={() => onOpenChange(false)} />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

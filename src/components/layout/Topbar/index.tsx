'use client';

import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { UserMenu } from '@/components/layout/UserMenu';
import { LocaleSwitcher } from '@/components/preferences/LocaleSwitcher';
import { ThemeToggle } from '@/components/preferences/ThemeToggle';
import { IconButton } from '@/components/ui/IconButton';
import type { UserViewModel } from '@/presenters/user';
import styles from './styles.module.scss';

interface TopbarProps {
  user: UserViewModel;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenNavigation: () => void;
  navigationOpen: boolean;
  onCreateAccount: () => void;
}

export function Topbar({
  user,
  collapsed,
  onToggleCollapsed,
  onOpenNavigation,
  navigationOpen,
  onCreateAccount,
}: TopbarProps) {
  const t = useTranslations('a11y');

  return (
    <header className={styles.topbar}>
      <div className={styles.topbar__start}>
        <IconButton
          className={styles.topbar__menu}
          label={t('openNavigation')}
          icon={<Menu aria-hidden="true" />}
          onClick={onOpenNavigation}
          aria-expanded={navigationOpen}
          aria-haspopup="dialog"
          tooltip={false}
        />
        <IconButton
          className={styles.topbar__collapse}
          label={`${collapsed ? t('expandSidebar') : t('collapseSidebar')} (${t('sidebarShortcut')})`}
          icon={
            collapsed ? (
              <PanelLeftOpen className={styles.topbar__panelIcon} aria-hidden="true" />
            ) : (
              <PanelLeftClose className={styles.topbar__panelIcon} aria-hidden="true" />
            )
          }
          onClick={onToggleCollapsed}
          aria-pressed={collapsed}
        />
        <span className={styles.topbar__divider} aria-hidden="true" />
        <Breadcrumbs />
      </div>
      <div className={styles.topbar__end}>
        <ThemeToggle />
        <LocaleSwitcher />
        <UserMenu user={user} onCreateAccount={onCreateAccount} />
      </div>
    </header>
  );
}

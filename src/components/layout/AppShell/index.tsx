'use client';

import type { ReactNode } from 'react';
import { GuestUpgradeDialog } from '@/components/account/GuestUpgradeDialog';
import { GuestBanner } from '@/components/layout/GuestBanner';
import { MobileNav } from '@/components/layout/MobileNav';
import { SidebarNav } from '@/components/layout/Sidebar';
import { MAIN_CONTENT_ID } from '@/components/layout/SkipLink';
import { Topbar } from '@/components/layout/Topbar';
import type { SidebarState } from '@/constants/preferences';
import { cx } from '@/lib/cx';
import type { UserViewModel } from '@/presenters/user';
import { useAppShell } from './logic';
import styles from './styles.module.scss';

interface AppShellProps {
  user: UserViewModel;
  initialSidebar: SidebarState;
  guestBannerDismissed: boolean;
  guestTtlHours: number;
  children: ReactNode;
}

export function AppShell({
  user,
  initialSidebar,
  guestBannerDismissed,
  guestTtlHours,
  children,
}: AppShellProps) {
  const { collapsed, toggleCollapsed, drawerOpen, setDrawerOpen, upgradeOpen, setUpgradeOpen } =
    useAppShell(initialSidebar);
  const openUpgrade = () => setUpgradeOpen(true);

  return (
    <div className={cx(styles.shell, collapsed && styles.shell_collapsed)}>
      <aside className={styles.shell__sidebar}>
        <SidebarNav collapsed={collapsed} />
      </aside>
      <MobileNav open={drawerOpen} onOpenChange={setDrawerOpen} />
      <div className={styles.shell__body}>
        <Topbar
          user={user}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          onOpenNavigation={() => setDrawerOpen(true)}
          navigationOpen={drawerOpen}
          onCreateAccount={openUpgrade}
        />
        {user.isGuest ? (
          <GuestBanner
            initiallyDismissed={guestBannerDismissed}
            ttlHours={guestTtlHours}
            onCreateAccount={openUpgrade}
          />
        ) : null}
        <main className={styles.shell__main} id={MAIN_CONTENT_ID} tabIndex={-1}>
          <div className={styles.shell__content}>{children}</div>
        </main>
      </div>
      {user.isGuest ? (
        <GuestUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      ) : null}
    </div>
  );
}

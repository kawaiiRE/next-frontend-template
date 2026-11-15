'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  SIDEBAR_COOKIE,
  type SidebarState,
} from '@/constants/preferences';
import { writePreferenceCookie } from '@/lib/client-cookies';

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * Desktop collapse is persisted in a cookie so the server renders the right width (no layout jump).
 * The mobile drawer is tied to the pathname it was opened on, so any navigation closes it.
 */
export function useAppShell(initialSidebar: SidebarState) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialSidebar === 'collapsed');
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    writePreferenceCookie(
      SIDEBAR_COOKIE,
      next ? 'collapsed' : 'expanded',
      PREFERENCE_COOKIE_MAX_AGE_SECONDS,
    );
  }, [collapsed]);

  const setDrawerOpen = useCallback(
    (open: boolean) => setDrawerPath(open ? pathname : null),
    [pathname],
  );

  // Ctrl/⌘ + B toggles the rail. Keyboard-initiated, so the change is instant (no animation).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b' || !(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey || isEditableTarget(event.target)) return;
      event.preventDefault();
      toggleCollapsed();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleCollapsed]);

  return { collapsed, toggleCollapsed, drawerOpen, setDrawerOpen, upgradeOpen, setUpgradeOpen };
}

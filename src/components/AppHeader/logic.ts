'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_ROUTES } from '@/constants/routes';
import { COPY } from '@/content/copy';

export type NavigationIconName = 'overview' | 'layers' | 'blocks' | 'pulse';

interface NavigationItem {
  href: string;
  icon: NavigationIconName;
  label: string;
}

export function useNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const closeNavigation = useCallback(() => setIsOpen(false), []);
  const toggleNavigation = useCallback(() => setIsOpen((value) => !value), []);

  const navigationItems = useMemo<NavigationItem[]>(
    () => [
      { href: APP_ROUTES.overview, icon: 'overview', label: COPY.navigation.overview },
      { href: APP_ROUTES.architecture, icon: 'layers', label: COPY.navigation.architecture },
      { href: APP_ROUTES.foundation, icon: 'blocks', label: COPY.navigation.foundation },
      { href: APP_ROUTES.systemHealth, icon: 'pulse', label: COPY.navigation.health },
    ],
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNavigation();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeNavigation, isOpen]);

  return { closeNavigation, isOpen, navigationItems, toggleNavigation };
}

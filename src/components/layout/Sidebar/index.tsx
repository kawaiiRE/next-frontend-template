'use client';

import {
  LayoutDashboard,
  NotebookPen,
  Plus,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/layout/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { APP_NAVIGATION, isActivePath, type AppNavIcon } from '@/constants/navigation';
import { APP_ROUTES } from '@/constants/routes';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

const ICONS: Record<AppNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  notes: NotebookPen,
  profile: UserRound,
  settings: Settings,
};

interface SidebarNavProps {
  collapsed?: boolean;
  /** Called after a link is activated (closes the mobile drawer). */
  onNavigate?: () => void;
}

/** Navigation content shared by the desktop rail and the mobile drawer. */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const t = useTranslations('nav');
  const a11y = useTranslations('a11y');
  const pathname = usePathname();

  return (
    <div className={cx(styles.nav, collapsed && styles.nav_collapsed)}>
      <div className={styles.nav__brand}>
        <Logo href={APP_ROUTES.dashboard} compact={collapsed} onNavigate={onNavigate} />
      </div>

      <div className={styles.nav__cta}>
        {collapsed ? (
          <Tooltip content={t('newNote')} side="inline-end">
            <Link
              className={styles.nav__ctaCompact}
              href={APP_ROUTES.newNote}
              onClick={onNavigate}
              aria-label={t('newNote')}
            >
              <Plus aria-hidden="true" />
            </Link>
          </Tooltip>
        ) : (
          <ButtonLink
            href={APP_ROUTES.newNote}
            fullWidth
            iconStart={<Plus aria-hidden="true" />}
            onClick={onNavigate}
          >
            {t('newNote')}
          </ButtonLink>
        )}
      </div>

      <nav className={styles.nav__sections} aria-label={a11y('mainNavigation')}>
        {APP_NAVIGATION.map((section) => (
          <div key={section.label} className={styles.nav__section}>
            <p className={styles.nav__sectionLabel} aria-hidden={collapsed || undefined}>
              {t(section.label)}
            </p>
            <ul className={styles.nav__list}>
              {section.items.map((item) => {
                const Icon = ICONS[item.icon];
                const active = isActivePath(pathname, item.href);
                const link = (
                  <Link
                    href={item.href}
                    className={cx(styles.nav__link, active && styles.nav__link_active)}
                    aria-current={active ? 'page' : undefined}
                    aria-label={collapsed ? t(item.label) : undefined}
                    onClick={onNavigate}
                  >
                    <Icon className={styles.nav__icon} aria-hidden="true" />
                    {collapsed ? null : <span className={styles.nav__label}>{t(item.label)}</span>}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip content={t(item.label)} side="inline-end">
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

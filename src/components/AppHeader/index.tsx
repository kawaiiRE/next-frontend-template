'use client';

import Link from 'next/link';
import { APP_ROUTES } from '@/constants/routes';
import { COPY } from '@/content/copy';
import { type NavigationIconName, useNavigation } from './logic';
import styles from './styles.module.scss';

interface NavigationIconProps {
  name: NavigationIconName;
}

function NavigationIcon({ name }: NavigationIconProps) {
  if (name === 'layers') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m12 3 9 5-9 5-9-5 9-5Zm-7.5 9 7.5 4.2 7.5-4.2M4.5 16l7.5 4 7.5-4" />
      </svg>
    );
  }

  if (name === 'blocks') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <path d="M17.5 14v7M14 17.5h7" />
      </svg>
    );
  }

  if (name === 'pulse') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M3 12h4l2.2-5 4.1 10 2.2-5H21" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}

export function AppHeader() {
  const { closeNavigation, isOpen, navigationItems, toggleNavigation } = useNavigation();

  return (
    <>
      <aside
        className={isOpen ? styles.sidebarOpen : styles.sidebar}
        id="primary-sidebar"
        aria-label="Site sidebar"
      >
        <div className={styles.sidebar__brandRow}>
          <Link className={styles.sidebar__brand} href={APP_ROUTES.home} onClick={closeNavigation}>
            <span className={styles.sidebar__brandMark} aria-hidden="true">
              N
            </span>
            <span>
              <strong>{COPY.brand}</strong>
              <small>{COPY.brandLabel}</small>
            </span>
          </Link>
          <button
            className={styles.sidebar__close}
            type="button"
            aria-label={COPY.navigation.close}
            onClick={closeNavigation}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className={styles.sidebar__sectionLabel}>Workspace</p>
        <nav className={styles.sidebar__navigation} aria-label={COPY.navigation.primaryLabel}>
          {navigationItems.map((item, index) => (
            <Link
              className={index === 0 ? styles.sidebar__linkActive : styles.sidebar__link}
              href={item.href}
              key={item.href}
              onClick={closeNavigation}
            >
              <span className={styles.sidebar__icon}>
                <NavigationIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebar__stackCard}>
          <span className={styles.sidebar__stackIcon} aria-hidden="true">
            NP
          </span>
          <div>
            <strong>Full-stack ready</strong>
            <p>Two clean codebases connected by one contract.</p>
          </div>
        </div>

        <div className={styles.sidebar__footer}>
          <span className={styles.sidebar__statusDot} aria-hidden="true" />
          {COPY.navigation.status}
        </div>
      </aside>

      {isOpen ? (
        <button
          className={styles.backdrop}
          type="button"
          aria-label={COPY.navigation.close}
          onClick={closeNavigation}
        />
      ) : null}

      <header className={styles.topbar}>
        <div className={styles.topbar__start}>
          <button
            className={styles.topbar__menu}
            type="button"
            aria-expanded={isOpen}
            aria-controls="primary-sidebar"
            aria-label={COPY.navigation.open}
            onClick={toggleNavigation}
          >
            <span />
            <span />
          </button>
          <div>
            <p className={styles.topbar__eyebrow}>Workspace</p>
            <p className={styles.topbar__title}>Overview</p>
          </div>
        </div>
        <div className={styles.topbar__end}>
          <span className={styles.topbar__badge}>Production foundation</span>
          <span className={styles.topbar__avatar} aria-hidden="true">
            NT
          </span>
        </div>
      </header>
    </>
  );
}

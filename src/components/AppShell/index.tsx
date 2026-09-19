import type { ReactNode } from 'react';
import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import styles from './styles.module.scss';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.shell__skipLink} href="#main-content">
        Skip to content
      </a>
      <AppHeader />
      <div className={styles.shell__content}>
        <main className={styles.shell__main} id="main-content">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}

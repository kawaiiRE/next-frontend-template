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
      <AppHeader />
      <main className={styles.shell__main}>{children}</main>
      <AppFooter />
    </div>
  );
}

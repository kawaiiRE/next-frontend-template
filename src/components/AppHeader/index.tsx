import Link from 'next/link';
import { APP_ROUTES } from '@/constants/routes';
import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.header__inner}>
        <Link className={styles.header__brand} href={APP_ROUTES.home}>
          {COPY.brand}
        </Link>
        <nav aria-label="Primary navigation">
          <Link className={styles.header__link} href={APP_ROUTES.home}>
            {COPY.navigation.home}
          </Link>
        </nav>
      </div>
    </header>
  );
}

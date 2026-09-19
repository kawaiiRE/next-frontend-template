import Link from 'next/link';
import { APP_ROUTES } from '@/constants/routes';
import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

export function NotFoundPage() {
  return (
    <section className={styles.notFound}>
      <h1 className={styles.notFound__title}>{COPY.notFound.title}</h1>
      <p className={styles.notFound__description}>{COPY.notFound.description}</p>
      <Link className={styles.notFound__link} href={APP_ROUTES.home}>
        {COPY.notFound.home}
      </Link>
    </section>
  );
}

import { HealthStatus } from '@/components/HealthStatus';
import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

export function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.home__hero}>
        <p className={styles.home__eyebrow}>{COPY.home.eyebrow}</p>
        <h1 className={styles.home__title}>{COPY.home.title}</h1>
        <p className={styles.home__description}>{COPY.home.description}</p>
      </section>

      <section className={styles.home__grid} aria-label={COPY.home.architectureTitle}>
        <article className={styles.home__card}>
          <h2 className={styles.home__cardTitle}>{COPY.home.architectureTitle}</h2>
          <p className={styles.home__cardDescription}>{COPY.home.architectureDescription}</p>
        </article>
        <HealthStatus />
      </section>
    </div>
  );
}

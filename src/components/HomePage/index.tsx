import { HealthStatus } from '@/components/HealthStatus';
import { APP_ROUTES } from '@/constants/routes';
import { COPY } from '@/content/copy';
import styles from './styles.module.scss';

export function HomePage() {
  return (
    <div className={styles.home} id="overview">
      <section className={styles.home__hero}>
        <div className={styles.home__heroContent}>
          <p className={styles.home__eyebrow}>
            <span aria-hidden="true" />
            {COPY.home.eyebrow}
          </p>
          <h1 className={styles.home__title}>{COPY.home.title}</h1>
          <p className={styles.home__description}>{COPY.home.description}</p>
          <div className={styles.home__actions}>
            <a className={styles.home__primaryAction} href={APP_ROUTES.architecture}>
              {COPY.home.primaryAction}
              <span aria-hidden="true">→</span>
            </a>
            <a className={styles.home__secondaryAction} href={APP_ROUTES.systemHealth}>
              {COPY.home.secondaryAction}
            </a>
          </div>
        </div>

        <div className={styles.home__preview} aria-label="Application layer preview">
          <div className={styles.home__previewHeader}>
            <span />
            <span />
            <span />
            <p>request.flow</p>
          </div>
          <div className={styles.home__previewBody}>
            <div className={styles.home__previewRail}>
              <span className={styles.home__previewRailActive} />
              <span />
              <span />
              <span />
            </div>
            <div className={styles.home__previewCode}>
              <p>
                <span>01</span> browser.request(<strong>&apos;/api/health&apos;</strong>)
              </p>
              <p>
                <span>02</span> contract.<em>safeParse</em>(response)
              </p>
              <p>
                <span>03</span> presenter.<em>toViewModel</em>(data)
              </p>
              <p>
                <span>04</span> interface.<strong>render</strong>(healthy)
              </p>
              <div className={styles.home__previewResult}>
                <span aria-hidden="true" />
                Contract verified
                <small>38 ms</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.home__proof} aria-label={COPY.home.proofLabel}>
        <p>{COPY.home.proofLabel}</p>
        <div className={styles.home__proofGrid}>
          {COPY.home.proofItems.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.home__section} id="architecture">
        <div className={styles.home__sectionHeading}>
          <div>
            <p className={styles.home__sectionEyebrow}>{COPY.home.architecture.eyebrow}</p>
            <h2>{COPY.home.architecture.title}</h2>
          </div>
          <p>{COPY.home.architecture.description}</p>
        </div>
        <div className={styles.home__architecture}>
          {COPY.home.architecture.steps.map((step, index) => (
            <article className={styles.home__architectureCard} key={step.title}>
              <div className={styles.home__architectureTopline}>
                <span>{step.number}</span>
                <small>{step.meta}</small>
              </div>
              <div className={styles.home__architectureIcon} aria-hidden="true">
                {index === 0 ? 'R' : index === 1 ? 'N' : 'P'}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < COPY.home.architecture.steps.length - 1 ? (
                <span className={styles.home__architectureArrow} aria-hidden="true">
                  →
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.home__section} id="foundation">
        <div className={styles.home__sectionHeading}>
          <div>
            <p className={styles.home__sectionEyebrow}>{COPY.home.foundation.eyebrow}</p>
            <h2>{COPY.home.foundation.title}</h2>
          </div>
          <p>{COPY.home.foundation.description}</p>
        </div>
        <div className={styles.home__features}>
          {COPY.home.foundation.items.map((item) => (
            <article className={styles.home__featureCard} key={item.title}>
              <div className={styles.home__featureTopline}>
                <span>{item.number}</span>
                <small>{item.tag}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.home__deployment}>
        <div>
          <p>{COPY.home.deployment.label}</p>
          <h2>{COPY.home.deployment.title}</h2>
        </div>
        <div>
          <p>{COPY.home.deployment.description}</p>
          <ul>
            {COPY.home.deployment.tags.map((tag) => (
              <li key={tag}>
                <span aria-hidden="true">✓</span>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.home__section} id="system-health">
        <div className={styles.home__sectionHeadingCompact}>
          <div>
            <p className={styles.home__sectionEyebrow}>{COPY.health.eyebrow}</p>
            <h2>See the contract working.</h2>
          </div>
        </div>
        <HealthStatus />
      </section>
    </div>
  );
}

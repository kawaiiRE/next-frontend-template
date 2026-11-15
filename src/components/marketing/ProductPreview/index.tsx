import { Archive, FileText, LayoutDashboard, NotebookPen, Settings, UserRound } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { SITE_CONFIG } from '@/config/site';
import styles from './styles.module.scss';

/** Decorative, static rendering of the app shell for the landing page. */
export function ProductPreview() {
  const t = useTranslations('marketing.preview');
  const format = useFormatter();
  const stats = [
    { label: t('statNotes'), value: 128, icon: FileText },
    { label: t('statActive'), value: 96, icon: NotebookPen },
    { label: t('statArchived'), value: 32, icon: Archive },
  ];
  const notes = [t('noteOne'), t('noteTwo'), t('noteThree')];

  return (
    <figure className={styles.preview} aria-label={t('label')}>
      <div className={styles.preview__window} aria-hidden="true">
        <div className={styles.preview__chrome}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.preview__body}>
          <div className={styles.preview__rail}>
            <span className={styles.preview__mark}>{SITE_CONFIG.brandMark}</span>
            <span className={styles.preview__railItemActive}>
              <LayoutDashboard />
            </span>
            <span className={styles.preview__railItem}>
              <NotebookPen />
            </span>
            <span className={styles.preview__railItem}>
              <UserRound />
            </span>
            <span className={styles.preview__railItem}>
              <Settings />
            </span>
          </div>
          <div className={styles.preview__main}>
            <p className={styles.preview__greeting}>{t('greeting')}</p>
            <div className={styles.preview__stats}>
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className={styles.preview__stat}>
                  <Icon />
                  <span className={styles.preview__statLabel}>{label}</span>
                  <strong>{format.number(value)}</strong>
                </div>
              ))}
            </div>
            <div className={styles.preview__list}>
              <p className={styles.preview__listTitle}>{t('recent')}</p>
              {notes.map((note, index) => (
                <div key={note} className={styles.preview__row}>
                  <span className={styles.preview__rowIcon}>
                    <FileText />
                  </span>
                  <span className={styles.preview__rowText}>
                    <strong>{note}</strong>
                    <span className={styles.preview__rowLine} data-length={index} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

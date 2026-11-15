import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import styles from './styles.module.scss';

const QUESTIONS = ['stack', 'mobile', 'language', 'customize'] as const;

/** Native disclosure widgets: keyboard and screen-reader support without JavaScript. */
export function Faq() {
  const t = useTranslations('marketing.faq');

  return (
    <section className={styles.faq} id="faq" aria-labelledby="faq-title">
      <SectionHeading id="faq-title" eyebrow={t('eyebrow')} title={t('title')} />
      <div className={styles.faq__list}>
        {QUESTIONS.map((key) => (
          <details key={key} className={styles.faq__item} name="faq">
            <summary className={styles.faq__question}>
              <span>{t(`${key}.question`)}</span>
              <Plus className={styles.faq__icon} aria-hidden="true" />
            </summary>
            <p className={styles.faq__answer}>{t(`${key}.answer`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

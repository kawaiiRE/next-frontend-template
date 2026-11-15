import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import styles from './styles.module.scss';

interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  tone?: 'default' | 'danger';
  children: ReactNode;
}

/** Two-column settings row: explanation on the start side, controls on the end side. */
export function SettingsSection({
  id,
  title,
  description,
  tone = 'default',
  children,
}: SettingsSectionProps) {
  return (
    <Card tone={tone} aria-labelledby={id} className={styles.section}>
      <div className={styles.section__text}>
        <h2
          className={tone === 'danger' ? styles.section__titleDanger : styles.section__title}
          id={id}
        >
          {title}
        </h2>
        <p className={styles.section__description}>{description}</p>
      </div>
      <div className={styles.section__control}>{children}</div>
    </Card>
  );
}

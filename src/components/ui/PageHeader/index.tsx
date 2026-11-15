import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  meta?: ReactNode;
}

export function PageHeader({ title, description, actions, back, meta }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {back ? (
        <Link className={styles.header__back} href={back.href}>
          <ArrowLeft className={styles.header__backIcon} aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className={styles.header__row}>
        <div className={styles.header__text}>
          <h1 className={styles.header__title}>{title}</h1>
          {description ? <p className={styles.header__description}>{description}</p> : null}
          {meta ? <div className={styles.header__meta}>{meta}</div> : null}
        </div>
        {actions ? <div className={styles.header__actions}>{actions}</div> : null}
      </div>
    </header>
  );
}

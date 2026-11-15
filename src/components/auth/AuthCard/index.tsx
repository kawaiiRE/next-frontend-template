import type { ReactNode } from 'react';
import styles from './styles.module.scss';

interface AuthCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ icon, title, subtitle, children, footer }: AuthCardProps) {
  return (
    <section className={styles.card} aria-labelledby="auth-title">
      {icon ? (
        <span className={styles.card__icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h1 className={styles.card__title} id="auth-title">
        {title}
      </h1>
      {subtitle ? <p className={styles.card__subtitle}>{subtitle}</p> : null}
      {children ? <div className={styles.card__body}>{children}</div> : null}
      {footer ? <div className={styles.card__footer}>{footer}</div> : null}
    </section>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'div';
  tone?: 'default' | 'danger';
  padded?: boolean;
}

export function Card({
  as: Element = 'section',
  tone = 'default',
  padded = true,
  className,
  ...rest
}: CardProps) {
  return (
    <Element
      {...rest}
      className={cx(
        styles.card,
        tone === 'danger' && styles.card_danger,
        padded && styles.card_padded,
        className,
      )}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleAs?: 'h2' | 'h3';
  id?: string;
}

export function CardHeader({
  title,
  description,
  actions,
  titleAs: Title = 'h2',
  id,
}: CardHeaderProps) {
  return (
    <header className={styles.card__header}>
      <div className={styles.card__heading}>
        <Title className={styles.card__title} id={id}>
          {title}
        </Title>
        {description ? <p className={styles.card__description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.card__actions}>{actions}</div> : null}
    </header>
  );
}

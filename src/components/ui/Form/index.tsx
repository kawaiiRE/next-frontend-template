import type { FormHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

/** Vertical form stack. Validation is handled in JS (`noValidate`) with accessible field errors. */
export function Form({ className, ...rest }: FormHTMLAttributes<HTMLFormElement>) {
  return <form {...rest} noValidate className={cx(styles.form, className)} />;
}

export function FormActions({
  children,
  align = 'end',
}: {
  children: ReactNode;
  align?: 'start' | 'end';
}) {
  return (
    <div className={cx(styles.form__actions, align === 'start' && styles.form__actions_start)}>
      {children}
    </div>
  );
}

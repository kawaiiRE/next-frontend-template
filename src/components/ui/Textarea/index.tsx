'use client';

import { useFormatter } from 'next-intl';
import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import { useCharacterCount } from './logic';
import styles from './styles.module.scss';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  help?: ReactNode;
  error?: string | null;
  optionalLabel?: string;
  /** Shows a live `count / max` indicator when `maxLength` is set. */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    name,
    help,
    error,
    optionalLabel,
    showCount,
    className,
    id,
    maxLength,
    onChange,
    ...rest
  },
  ref,
) {
  const format = useFormatter();
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const countId = showCount && maxLength ? `${inputId}-count` : undefined;
  const { count, handleChange } = useCharacterCount(rest.defaultValue ?? rest.value, onChange);
  const nearLimit = maxLength ? count > maxLength * 0.9 : false;

  return (
    <div className={cx(styles.field, className)} data-invalid={error ? '' : undefined}>
      <label className={styles.field__label} htmlFor={inputId}>
        <span>{label}</span>
        {optionalLabel ? <span className={styles.field__optional}>{optionalLabel}</span> : null}
      </label>
      <textarea
        {...rest}
        ref={ref}
        id={inputId}
        name={name}
        maxLength={maxLength}
        onChange={handleChange}
        className={styles.field__input}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, helpId, countId].filter(Boolean).join(' ') || undefined}
      />
      <div className={styles.field__footer}>
        {error ? (
          <p className={styles.field__error} id={errorId}>
            {error}
          </p>
        ) : help ? (
          <p className={styles.field__help} id={helpId}>
            {help}
          </p>
        ) : (
          <span />
        )}
        {countId && maxLength ? (
          <span
            className={cx(styles.field__count, nearLimit && styles.field__countWarning)}
            id={countId}
          >
            {format.number(count)} / {format.number(maxLength)}
          </span>
        ) : null}
      </div>
    </div>
  );
});

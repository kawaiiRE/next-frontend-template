'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  name: string;
  help?: ReactNode;
  error?: string | null;
  optionalLabel?: string;
  iconStart?: ReactNode;
  endAdornment?: ReactNode;
  hideLabel?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    name,
    help,
    error,
    optionalLabel,
    iconStart,
    endAdornment,
    hideLabel,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx(styles.field, className)} data-invalid={error ? '' : undefined}>
      <label
        className={cx(styles.field__label, hideLabel && styles.field__labelHidden)}
        htmlFor={inputId}
      >
        <span>{label}</span>
        {optionalLabel ? <span className={styles.field__optional}>{optionalLabel}</span> : null}
      </label>
      <div className={styles.field__control}>
        {iconStart ? (
          <span className={styles.field__icon} aria-hidden="true">
            {iconStart}
          </span>
        ) : null}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          name={name}
          className={cx(
            styles.field__input,
            iconStart ? styles.field__input_withIcon : undefined,
            endAdornment ? styles.field__input_withAdornment : undefined,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        />
        {endAdornment ? <span className={styles.field__adornment}>{endAdornment}</span> : null}
      </div>
      {error ? (
        <p className={styles.field__error} id={errorId}>
          {error}
        </p>
      ) : help ? (
        <p className={styles.field__help} id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  );
});

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'>;

/** Password input with an accessible show/hide toggle (pasting stays allowed). */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const t = useTranslations('a11y');
    const [visible, setVisible] = useState(false);

    return (
      <TextField
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        endAdornment={
          <button
            type="button"
            className={styles.field__toggle}
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? t('hidePassword') : t('showPassword')}
            aria-pressed={visible}
          >
            {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        }
      />
    );
  },
);

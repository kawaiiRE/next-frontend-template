import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode, Ref } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Pick<SharedProps, 'variant' | 'size' | 'fullWidth' | 'className'>) {
  return cx(
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.button_fullWidth,
    className,
  );
}

export interface ButtonProps
  extends SharedProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant,
  size,
  iconStart,
  iconEnd,
  fullWidth,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      {loading ? <Spinner size="sm" /> : iconStart}
      <span className={styles.button__label}>{children}</span>
      {loading ? null : iconEnd}
    </button>
  );
}

export interface ButtonLinkProps
  extends SharedProps, Omit<ComponentProps<typeof Link>, 'children' | 'className'> {}

/** A navigation link styled as a button. Keeps link semantics (middle-click, prefetch). */
export function ButtonLink({
  variant,
  size,
  iconStart,
  iconEnd,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClassName({ variant, size, fullWidth, className })}>
      {iconStart}
      <span className={styles.button__label}>{children}</span>
      {iconEnd}
    </Link>
  );
}

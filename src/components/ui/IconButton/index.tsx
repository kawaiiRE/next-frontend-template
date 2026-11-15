'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name; also used as the tooltip text unless `tooltip={false}`. */
  label: string;
  icon: ReactNode;
  variant?: 'ghost' | 'outline' | 'soft';
  size?: 'sm' | 'md';
  tooltip?: boolean;
}

/** Square icon-only button with a required accessible label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    icon,
    variant = 'ghost',
    size = 'md',
    tooltip = true,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const button = (
    <button
      {...rest}
      ref={ref}
      type={type}
      aria-label={label}
      className={cx(
        styles.iconButton,
        styles[`iconButton_${variant}`],
        styles[`iconButton_${size}`],
        className,
      )}
    >
      {icon}
    </button>
  );

  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
});

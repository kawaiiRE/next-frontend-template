'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import styles from './styles.module.scss';

interface CheckboxProps {
  label: ReactNode;
  description?: ReactNode;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ label, description, onCheckedChange, ...rest }: CheckboxProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={styles.checkbox}>
      <BaseCheckbox.Root
        {...rest}
        id={id}
        className={styles.checkbox__box}
        aria-describedby={descriptionId}
        onCheckedChange={(checked) => onCheckedChange?.(checked)}
      >
        <BaseCheckbox.Indicator className={styles.checkbox__indicator}>
          <Check aria-hidden="true" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <div className={styles.checkbox__text}>
        <label className={styles.checkbox__label} htmlFor={id}>
          {label}
        </label>
        {description ? (
          <p className={styles.checkbox__description} id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

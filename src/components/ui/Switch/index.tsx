'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { useId, type ReactNode } from 'react';
import styles from './styles.module.scss';

interface SwitchProps {
  label: ReactNode;
  description?: ReactNode;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ label, description, onCheckedChange, ...rest }: SwitchProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={styles.switch}>
      <div className={styles.switch__text}>
        <label className={styles.switch__label} htmlFor={id}>
          {label}
        </label>
        {description ? (
          <p className={styles.switch__description} id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>
      <BaseSwitch.Root
        {...rest}
        id={id}
        className={styles.switch__track}
        aria-describedby={descriptionId}
        onCheckedChange={(checked) => onCheckedChange?.(checked)}
      >
        <BaseSwitch.Thumb className={styles.switch__thumb} />
      </BaseSwitch.Root>
    </div>
  );
}

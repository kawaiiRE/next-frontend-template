'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useId } from 'react';
import styles from './styles.module.scss';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Optional BCP-47 language of the label (e.g. native language names). */
  lang?: string;
}

interface SelectProps<T extends string> {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  hideLabel?: boolean;
}

export function Select<T extends string>({
  label,
  options,
  value,
  onValueChange,
  name,
  disabled,
  hideLabel,
}: SelectProps<T>) {
  const labelId = useId();

  return (
    <div className={styles.select}>
      <span className={hideLabel ? styles.select__labelHidden : styles.select__label} id={labelId}>
        {label}
      </span>
      <BaseSelect.Root
        name={name}
        value={value}
        disabled={disabled}
        items={options.map((option) => ({ value: option.value, label: option.label }))}
        onValueChange={(next) => {
          const match = options.find((option) => option.value === next);
          if (match) onValueChange(match.value);
        }}
      >
        <BaseSelect.Trigger className={styles.select__trigger} aria-labelledby={labelId}>
          <BaseSelect.Value className={styles.select__value} />
          <BaseSelect.Icon className={styles.select__icon}>
            <ChevronsUpDown aria-hidden="true" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            className={styles.select__positioner}
            sideOffset={6}
            alignItemWithTrigger={false}
          >
            <BaseSelect.Popup className={styles.select__popup}>
              <BaseSelect.List className={styles.select__list}>
                {options.map((option) => (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    className={styles.select__item}
                  >
                    <BaseSelect.ItemText lang={option.lang}>{option.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className={styles.select__indicator}>
                      <Check aria-hidden="true" />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  );
}

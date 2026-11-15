'use client';

import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  legend: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  hideLegend?: boolean;
  size?: 'sm' | 'md';
}

/** Native radio group styled as a segmented control (arrow keys work out of the box). */
export function SegmentedControl<T extends string>({
  legend,
  options,
  value,
  onValueChange,
  hideLegend,
  size = 'md',
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <fieldset className={styles.segmented}>
      <legend className={hideLegend ? styles.segmented__legendHidden : styles.segmented__legend}>
        {legend}
      </legend>
      <div className={cx(styles.segmented__track, styles[`segmented__track_${size}`])}>
        {options.map((option) => (
          <label key={option.value} className={styles.segmented__option}>
            <input
              className={styles.segmented__input}
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onValueChange(option.value)}
            />
            <span className={styles.segmented__pill}>
              {option.icon}
              <span className={styles.segmented__label}>{option.label}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

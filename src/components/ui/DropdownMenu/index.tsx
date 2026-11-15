'use client';

import { Menu } from '@base-ui/react/menu';
import { Check } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './styles.module.scss';

export type DropdownMenuEntry =
  | {
      type: 'item';
      key: string;
      label: string;
      icon?: ReactNode;
      onSelect: () => void;
      tone?: 'default' | 'danger';
      disabled?: boolean;
    }
  | { type: 'link'; key: string; label: string; icon?: ReactNode; href: string }
  | { type: 'separator'; key: string }
  | { type: 'label'; key: string; content: ReactNode };

interface DropdownMenuProps {
  /** Trigger element (must accept a ref and DOM props, e.g. `IconButton`). */
  trigger: ReactElement<Record<string, unknown>>;
  entries: readonly DropdownMenuEntry[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  header?: ReactNode;
}

/** Accessible menu (roving focus, typeahead, Escape) that scales out of its trigger. */
export function DropdownMenu({
  trigger,
  entries,
  align = 'end',
  side = 'bottom',
  header,
}: DropdownMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner className={styles.positioner} align={align} side={side} sideOffset={6}>
          <Menu.Popup className={styles.popup}>
            {header ? <div className={styles.popup__header}>{header}</div> : null}
            {entries.map((entry) => {
              switch (entry.type) {
                case 'separator':
                  return <Menu.Separator key={entry.key} className={styles.separator} />;
                case 'label':
                  return (
                    <div key={entry.key} className={styles.label}>
                      {entry.content}
                    </div>
                  );
                case 'link':
                  return (
                    <Menu.LinkItem
                      key={entry.key}
                      className={styles.item}
                      render={<Link href={entry.href} />}
                    >
                      {entry.icon ? <span className={styles.item__icon}>{entry.icon}</span> : null}
                      <span className={styles.item__label}>{entry.label}</span>
                    </Menu.LinkItem>
                  );
                default:
                  return (
                    <Menu.Item
                      key={entry.key}
                      className={cx(styles.item, entry.tone === 'danger' && styles.item_danger)}
                      onClick={entry.onSelect}
                      disabled={entry.disabled}
                    >
                      {entry.icon ? <span className={styles.item__icon}>{entry.icon}</span> : null}
                      <span className={styles.item__label}>{entry.label}</span>
                    </Menu.Item>
                  );
              }
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export interface MenuRadioOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  lang?: string;
}

interface RadioMenuProps<T extends string> {
  trigger: ReactElement<Record<string, unknown>>;
  label: string;
  value: T;
  options: readonly MenuRadioOption<T>[];
  onValueChange: (value: T) => void;
  align?: 'start' | 'center' | 'end';
}

/** Single-choice menu (theme, language) using `menuitemradio` semantics. */
export function RadioMenu<T extends string>({
  trigger,
  label,
  value,
  options,
  onValueChange,
  align = 'end',
}: RadioMenuProps<T>) {
  return (
    <Menu.Root>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner className={styles.positioner} align={align} sideOffset={6}>
          <Menu.Popup className={styles.popup}>
            <Menu.Group>
              <Menu.GroupLabel className={styles.label}>{label}</Menu.GroupLabel>
              <Menu.RadioGroup
                value={value}
                onValueChange={(next: unknown) => {
                  const match = options.find((option) => option.value === next);
                  if (match) onValueChange(match.value);
                }}
              >
                {options.map((option) => (
                  <Menu.RadioItem
                    key={option.value}
                    value={option.value}
                    className={styles.item}
                    closeOnClick
                  >
                    {option.icon ? <span className={styles.item__icon}>{option.icon}</span> : null}
                    <span className={styles.item__label} lang={option.lang}>
                      {option.label}
                    </span>
                    <Menu.RadioItemIndicator className={styles.item__check}>
                      <Check aria-hidden="true" />
                    </Menu.RadioItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

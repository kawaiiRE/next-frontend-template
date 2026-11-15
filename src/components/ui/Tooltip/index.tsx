'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import styles from './styles.module.scss';

interface TooltipProps {
  content: ReactNode;
  /** The trigger element; it must accept a ref and DOM props (e.g. a button). */
  children: ReactElement<Record<string, unknown>>;
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  disabled?: boolean;
}

export function Tooltip({ content, children, side = 'top', disabled = false }: TooltipProps) {
  if (disabled) return children;

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8} className={styles.positioner}>
          <BaseTooltip.Popup className={styles.popup}>{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export const TooltipProvider = BaseTooltip.Provider;

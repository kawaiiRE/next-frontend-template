'use client';

import { useCallback, useState, type ChangeEvent, type ChangeEventHandler } from 'react';

function lengthOf(value: unknown): number {
  return typeof value === 'string' ? value.length : 0;
}

/** Tracks the character count of a (possibly uncontrolled) textarea. */
export function useCharacterCount(
  initialValue: unknown,
  onChange?: ChangeEventHandler<HTMLTextAreaElement>,
) {
  const [count, setCount] = useState(() => lengthOf(initialValue));

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setCount(event.target.value.length);
      onChange?.(event);
    },
    [onChange],
  );

  return { count, handleChange };
}

import type { Formats } from 'next-intl';

export const formats = {
  dateTime: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    withTime: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  },
  number: {
    integer: { maximumFractionDigits: 0 },
  },
} satisfies Formats;

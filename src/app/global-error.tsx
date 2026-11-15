'use client';

import { FullPageError } from '@/components/feedback/FullPageError';
import '@/styles/globals.scss';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/** Last-resort boundary when the root layout itself fails. */
export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html lang="en" data-theme="system">
      <body>
        <FullPageError onRetry={retry} />
      </body>
    </html>
  );
}

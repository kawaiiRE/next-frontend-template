'use client';

import { ErrorState } from '@/components/ErrorState';

interface ErrorPageProps {
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return <ErrorState onRetry={reset} />;
}

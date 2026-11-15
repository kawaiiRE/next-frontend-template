'use client';

import { useEffect, useState } from 'react';
import { verifyEmail } from '@/services/auth';

export type VerifyState = 'verifying' | 'success' | 'failure';

/** Confirms the token once on mount (POST, so link prefetchers cannot trigger it). */
export function useVerifyEmail(token: string) {
  const [state, setState] = useState<VerifyState>('verifying');

  useEffect(() => {
    let active = true;
    void verifyEmail(token).then((result) => {
      if (active) setState(result.success ? 'success' : 'failure');
    });
    return () => {
      active = false;
    };
  }, [token]);

  return state;
}

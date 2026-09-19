'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HealthViewModel } from '@/contracts/health';
import { readHealth } from '@/services/health';

export type HealthStatusState =
  | { status: 'loading' }
  | { status: 'available'; data: HealthViewModel }
  | { status: 'unavailable' };

async function loadHealth(): Promise<HealthStatusState> {
  const result = await readHealth();
  return result.success ? { status: 'available', data: result.data } : { status: 'unavailable' };
}

export function useHealthStatus() {
  const [state, setState] = useState<HealthStatusState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    setState(await loadHealth());
  }, []);

  useEffect(() => {
    let active = true;
    void loadHealth().then((nextState) => {
      if (active) {
        setState(nextState);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { state, refresh };
}

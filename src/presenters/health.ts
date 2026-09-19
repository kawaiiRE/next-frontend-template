import type { HealthViewModel, PocketBaseHealthDto } from '@/contracts/health';

export function presentHealth(response: PocketBaseHealthDto): HealthViewModel {
  return {
    available: response.status === 'ok',
    apiVersion: response.apiVersion,
    service: response.service,
    checkedAt: response.time,
  };
}

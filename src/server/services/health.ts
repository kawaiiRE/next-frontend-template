import 'server-only';
import type { HealthViewModel } from '@/contracts/health';
import { presentHealth } from '@/presenters/health';
import { readPocketBaseHealth } from '@/server/repositories/health';

export async function getHealth(): Promise<HealthViewModel> {
  return presentHealth(await readPocketBaseHealth());
}

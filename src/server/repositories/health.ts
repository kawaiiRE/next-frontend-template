import 'server-only';
import {
  POCKETBASE_HEALTH_PATH,
  pocketBaseHealthSchema,
  type PocketBaseHealthDto,
} from '@/contracts/health';
import { createPocketBaseClient } from '@/server/pocketbase';

export async function readPocketBaseHealth(): Promise<PocketBaseHealthDto> {
  const client = createPocketBaseClient();
  const response: unknown = await client.send(POCKETBASE_HEALTH_PATH, {
    method: 'GET',
    signal: AbortSignal.timeout(5_000),
  });

  return pocketBaseHealthSchema.parse(response);
}

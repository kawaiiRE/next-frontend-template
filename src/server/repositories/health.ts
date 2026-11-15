import 'server-only';
import {
  POCKETBASE_HEALTH_PATH,
  pocketBaseHealthSchema,
  type PocketBaseHealthDto,
} from '@/contracts/health';
import { parseUpstream } from '@/server/http/errors';
import { createPocketBaseClient } from '@/server/pocketbase';

export async function readPocketBaseHealth(): Promise<PocketBaseHealthDto> {
  const response: unknown = await createPocketBaseClient().send(POCKETBASE_HEALTH_PATH, {
    method: 'GET',
  });
  return parseUpstream(pocketBaseHealthSchema, response);
}

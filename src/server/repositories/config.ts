import 'server-only';
import { appConfigSchema, type AppConfig } from '@/contracts/config';
import { parseUpstream } from '@/server/http/errors';
import { createPocketBaseClient } from '@/server/pocketbase';

export const POCKETBASE_CONFIG_PATH = '/api/v1/config';

export async function readPocketBaseConfig(): Promise<AppConfig> {
  const response: unknown = await createPocketBaseClient().send(POCKETBASE_CONFIG_PATH, {
    method: 'GET',
  });
  return parseUpstream(appConfigSchema, response);
}

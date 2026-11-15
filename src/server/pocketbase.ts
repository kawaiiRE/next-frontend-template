import 'server-only';
import PocketBase from 'pocketbase';
import { environment } from '@/server/environment';
import { currentClientIp } from '@/server/request-context';

const UPSTREAM_TIMEOUT_MS = 8_000;

/**
 * Creates a fresh SDK instance for one request/workflow. Never export or cache an authenticated
 * client: the SDK auth store is mutable state.
 *
 * Every upstream call carries the end user's IP in `X-Forwarded-For` (overwriting any incoming
 * value) so PocketBase, started with `PB_TRUSTED_PROXY_HEADERS=X-Forwarded-For`, rate-limits per
 * user rather than per gateway.
 */
export function createPocketBaseClient(token?: string) {
  const client = new PocketBase(environment().POCKETBASE_URL);
  client.autoCancellation(false);
  client.beforeSend = async (url, options) => {
    const clientIp = await currentClientIp();
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
    delete headers['X-Forwarded-For'];
    delete headers['x-forwarded-for'];
    if (clientIp) headers['X-Forwarded-For'] = clientIp;

    return {
      url,
      options: {
        ...options,
        headers,
        signal: options.signal ?? AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      },
    };
  };

  if (token) client.authStore.save(token);
  return client;
}

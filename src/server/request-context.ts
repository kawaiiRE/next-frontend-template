import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';
import { headers } from 'next/headers';
import { environment } from '@/server/environment';
import { clientIpFromHeaders } from '@/server/http/request';

interface RequestContext {
  clientIp: string | null;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Route handlers and the proxy run upstream work inside this so PocketBase sees the real client. */
export function runWithRequestContext<T>(request: Request, work: () => Promise<T>): Promise<T> {
  const clientIp = clientIpFromHeaders(request.headers, environment().CLIENT_IP_HEADER);
  return storage.run({ clientIp }, work);
}

/** Client IP for the current request; Server Components and Actions fall back to `headers()`. */
export async function currentClientIp(): Promise<string | null> {
  const context = storage.getStore();
  if (context) return context.clientIp;

  try {
    return clientIpFromHeaders(await headers(), environment().CLIENT_IP_HEADER);
  } catch {
    return null;
  }
}

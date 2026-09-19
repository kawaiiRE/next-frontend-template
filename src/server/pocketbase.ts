import 'server-only';
import PocketBase from 'pocketbase';
import { environment } from '@/server/environment';

export function createPocketBaseClient(token?: string) {
  const client = new PocketBase(environment().POCKETBASE_URL);
  client.autoCancellation(false);

  if (token) {
    client.authStore.save(token);
  }

  return client;
}

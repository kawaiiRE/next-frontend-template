import 'server-only';
import { pocketBaseUserSchema, type PocketBaseUser } from '@/contracts/pocketbase';
import type { Locale } from '@/i18n/config';
import { parseUpstream } from '@/server/http/errors';
import { createPocketBaseClient } from '@/server/pocketbase';

const USERS = 'users';

export async function getUser(token: string, id: string): Promise<PocketBaseUser> {
  const record = await createPocketBaseClient(token).collection(USERS).getOne(id);
  return parseUpstream(pocketBaseUserSchema, record);
}

export async function updateUser(
  token: string,
  id: string,
  changes: { name?: string; locale?: Locale | null },
): Promise<PocketBaseUser> {
  const body: Record<string, string> = {};
  if (changes.name !== undefined) body.name = changes.name;
  if (changes.locale !== undefined) body.locale = changes.locale ?? '';

  const record = await createPocketBaseClient(token).collection(USERS).update(id, body);
  return parseUpstream(pocketBaseUserSchema, record);
}

export async function changePassword(
  token: string,
  id: string,
  currentPassword: string,
  password: string,
): Promise<void> {
  await createPocketBaseClient(token).collection(USERS).update(id, {
    oldPassword: currentPassword,
    password,
    passwordConfirm: password,
  });
}

export async function deleteUser(token: string, id: string): Promise<void> {
  await createPocketBaseClient(token).collection(USERS).delete(id);
}

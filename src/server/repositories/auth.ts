import 'server-only';
import {
  pocketBaseAuthSchema,
  pocketBaseRegisteredUserSchema,
  type PocketBaseAuth,
  type PocketBaseRegisteredUser,
} from '@/contracts/pocketbase';
import type { RegisterInput } from '@/contracts/auth';
import type { Locale } from '@/i18n/config';
import { parseUpstream } from '@/server/http/errors';
import { createPocketBaseClient } from '@/server/pocketbase';

const USERS = 'users';
export const POCKETBASE_REGISTER_PATH = '/api/v1/auth/register';
export const POCKETBASE_GUEST_PATH = '/api/v1/auth/guest';
export const POCKETBASE_GUEST_UPGRADE_PATH = '/api/v1/auth/guest/upgrade';

function accountBody(input: RegisterInput) {
  return {
    name: input.name,
    email: input.email,
    password: input.password,
    ...(input.locale ? { locale: input.locale } : {}),
  };
}

export async function authWithPassword(email: string, password: string): Promise<PocketBaseAuth> {
  const client = createPocketBaseClient();
  const response = await client.collection(USERS).authWithPassword(email, password);
  return parseUpstream(pocketBaseAuthSchema, response);
}

export async function refreshAuth(token: string): Promise<PocketBaseAuth> {
  const client = createPocketBaseClient(token);
  const response = await client.collection(USERS).authRefresh();
  return parseUpstream(pocketBaseAuthSchema, response);
}

export async function registerUser(input: RegisterInput): Promise<PocketBaseRegisteredUser> {
  const client = createPocketBaseClient();
  const response: unknown = await client.send(POCKETBASE_REGISTER_PATH, {
    method: 'POST',
    body: accountBody(input),
  });
  return parseUpstream(pocketBaseRegisteredUserSchema, response);
}

/** Creates a temporary guest account (named in `locale`) and returns its session. */
export async function createGuest(locale: Locale): Promise<PocketBaseAuth> {
  const response: unknown = await createPocketBaseClient().send(POCKETBASE_GUEST_PATH, {
    method: 'POST',
    body: { locale },
  });
  return parseUpstream(pocketBaseAuthSchema, response);
}

export type GuestUpgradeResult =
  | { status: 'authenticated'; auth: PocketBaseAuth }
  | { status: 'verification_required'; user: PocketBaseRegisteredUser };

/**
 * Turns the authenticated guest into a regular account. PocketBase answers `{ token, record }`, or
 * `202` with the user DTO (no token) when the new address must be verified first.
 */
export async function upgradeGuest(
  token: string,
  input: RegisterInput,
): Promise<GuestUpgradeResult> {
  const response: unknown = await createPocketBaseClient(token).send(
    POCKETBASE_GUEST_UPGRADE_PATH,
    {
      method: 'POST',
      body: accountBody(input),
    },
  );
  if (typeof response === 'object' && response !== null && 'token' in response) {
    return { status: 'authenticated', auth: parseUpstream(pocketBaseAuthSchema, response) };
  }
  return {
    status: 'verification_required',
    user: parseUpstream(pocketBaseRegisteredUserSchema, response),
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  await createPocketBaseClient().collection(USERS).requestPasswordReset(email);
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  await createPocketBaseClient().collection(USERS).confirmPasswordReset(token, password, password);
}

export async function requestVerification(email: string): Promise<void> {
  await createPocketBaseClient().collection(USERS).requestVerification(email);
}

export async function confirmVerification(token: string): Promise<void> {
  await createPocketBaseClient().collection(USERS).confirmVerification(token);
}

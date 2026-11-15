import { ClientResponseError } from 'pocketbase';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authRepository from '../src/server/repositories/auth';
import * as configService from '../src/server/services/config';
import { startGuestSession, upgradeGuestSession } from '../src/server/services/auth';
import { setTestEnvironment } from './support/env';
import { fakeToken } from './support/tokens';

beforeEach(setTestEnvironment);

const record = {
  id: 'guest0000000001',
  email: 'guest-abc@guest.invalid',
  name: 'Guest',
  verified: true,
  guest: true,
  locale: 'en' as const,
  created: '2026-10-18T12:00:00.000Z',
};
const input = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'correct horse' };

function pbError(status: number, response: Record<string, unknown> = {}) {
  return new ClientResponseError({ url: 'http://pb/api', status, response });
}

function configWithGuests(guest: boolean) {
  vi.spyOn(configService, 'getAppConfig').mockResolvedValue({
    apiVersion: 1,
    features: { registration: true, emailVerification: false, guest, guestTtlHours: 24 },
  });
}

describe('guest sessions', () => {
  it('refuses to start a guest session when the backend disables guests', async () => {
    configWithGuests(false);
    const create = vi.spyOn(authRepository, 'createGuest');
    await expect(startGuestSession('en')).rejects.toMatchObject({ code: 'GUEST_DISABLED' });
    expect(create).not.toHaveBeenCalled();
  });

  it('starts a guest session in the caller locale', async () => {
    configWithGuests(true);
    const token = fakeToken({ id: record.id, expiresInSeconds: 3600 });
    const create = vi.spyOn(authRepository, 'createGuest').mockResolvedValue({ token, record });
    const session = await startGuestSession('ar');
    expect(create).toHaveBeenCalledWith('ar');
    expect(session.user).toMatchObject({ id: record.id, isGuest: true });
  });

  it('returns a new session after an upgrade, or verification_required without one', async () => {
    const token = fakeToken({ id: record.id, expiresInSeconds: 3600 });
    vi.spyOn(authRepository, 'upgradeGuest').mockResolvedValueOnce({
      status: 'authenticated',
      auth: { token, record: { ...record, guest: false, email: input.email } },
    });
    await expect(upgradeGuestSession(token, input)).resolves.toMatchObject({
      status: 'authenticated',
      token,
      user: { isGuest: false, email: input.email },
    });

    vi.spyOn(authRepository, 'upgradeGuest').mockResolvedValueOnce({
      status: 'verification_required',
      user: {
        id: record.id,
        email: input.email,
        name: input.name,
        verified: false,
        guest: false,
        locale: null,
        createdAt: record.created,
      },
    });
    await expect(upgradeGuestSession(token, input)).resolves.toMatchObject({
      status: 'verification_required',
      user: { verified: false, isGuest: false },
    });
  });

  it.each([
    [pbError(409, { code: 'EMAIL_TAKEN' }), 'EMAIL_TAKEN'],
    [pbError(403, { code: 'NOT_GUEST' }), 'NOT_GUEST'],
    [pbError(403, { code: 'REGISTRATION_DISABLED' }), 'REGISTRATION_DISABLED'],
    [pbError(401, { code: 'AUTH_REQUIRED' }), 'UNAUTHENTICATED'],
    [pbError(400, { code: 'INVALID_INPUT', fields: { email: 'invalid_email' } }), 'INVALID_INPUT'],
    [pbError(429), 'RATE_LIMITED'],
  ])('maps upgrade failures to stable codes (%#)', async (error, code) => {
    vi.spyOn(authRepository, 'upgradeGuest').mockRejectedValue(error);
    await expect(upgradeGuestSession('token', input)).rejects.toMatchObject({ code });
  });
});

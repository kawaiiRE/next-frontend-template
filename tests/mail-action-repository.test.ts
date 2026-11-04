import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  verification: vi.fn(async () => true),
  password: vi.fn(async () => true),
  email: vi.fn(async () => true),
  collection: vi.fn(),
  factory: vi.fn(),
}));
vi.mock('@/server/pocketbase', () => ({ createPocketBaseClient: mocks.factory }));
vi.mock('@/server/environment', () => ({
  environment: () => ({ APP_ORIGIN: 'https://mail.test.invalid' }),
}));
import { executeMailAction } from '../src/server/repositories/mail-actions';
describe('canonical PocketBase email confirmation', () => {
  it('uses fresh canonical clients and the dedicated native token APIs without saving a session', async () => {
    mocks.collection.mockReturnValue({
      confirmVerification: mocks.verification,
      confirmPasswordReset: mocks.password,
      confirmEmailChange: mocks.email,
    });
    mocks.factory.mockImplementation(() => ({ collection: mocks.collection }));
    const link = { collection: 'users' as const, token: 'synthetic-token-for-native-api' };
    await executeMailAction({ ...link, action: 'verification' });
    await executeMailAction({
      ...link,
      action: 'password-reset',
      password: 'synthetic-password',
      passwordConfirm: 'synthetic-password',
    });
    await executeMailAction({ ...link, action: 'email-change', password: 'synthetic-password' });
    expect(mocks.factory.mock.calls).toEqual([[], [], []]);
    expect(mocks.collection.mock.calls).toEqual([['users'], ['users'], ['users']]);
    expect(mocks.verification).toHaveBeenCalledWith(
      link.token,
      expect.objectContaining({ fetch: expect.any(Function), requestKey: null }),
    );
    expect(mocks.password).toHaveBeenCalledWith(
      link.token,
      'synthetic-password',
      'synthetic-password',
      expect.any(Object),
    );
    expect(mocks.email).toHaveBeenCalledWith(link.token, 'synthetic-password', expect.any(Object));
  });
});

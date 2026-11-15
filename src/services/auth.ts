import {
  webRegisterResponseSchema,
  type LoginInput,
  type PasswordResetConfirmInput,
  type RegisterInput,
  type WebRegisterResponse,
} from '@/contracts/auth';
import { userEnvelopeSchema, type User } from '@/contracts/user';
import { API_ROUTES } from '@/constants/routes';
import { expectEmpty, request, type ApiResult } from '@/services/api';
import { z } from 'zod';

export function login(input: LoginInput): Promise<ApiResult<User>> {
  return request(API_ROUTES.login, (value) => userEnvelopeSchema.parse(value).user, {
    method: 'POST',
    body: input,
  });
}

export function register(input: RegisterInput): Promise<ApiResult<WebRegisterResponse>> {
  return request(API_ROUTES.register, (value) => webRegisterResponseSchema.parse(value), {
    method: 'POST',
    body: input,
  });
}

export function logout(): Promise<ApiResult<void>> {
  return request(API_ROUTES.logout, expectEmpty, { method: 'POST' });
}

export function requestPasswordReset(email: string): Promise<ApiResult<void>> {
  return request(
    API_ROUTES.passwordReset,
    (value) => {
      z.object({}).parse(value);
    },
    { method: 'POST', body: { email } },
  );
}

export function confirmPasswordReset(input: PasswordResetConfirmInput): Promise<ApiResult<void>> {
  return request(API_ROUTES.passwordResetConfirm, expectEmpty, { method: 'POST', body: input });
}

export function verifyEmail(token: string): Promise<ApiResult<void>> {
  return request(API_ROUTES.verifyEmail, expectEmpty, { method: 'POST', body: { token } });
}

export function requestVerification(email: string): Promise<ApiResult<void>> {
  return request(
    API_ROUTES.verificationRequest,
    (value) => {
      z.object({}).parse(value);
    },
    { method: 'POST', body: { email } },
  );
}

export function startGuestSession(): Promise<ApiResult<User>> {
  return request(API_ROUTES.guest, (value) => userEnvelopeSchema.parse(value).user, {
    method: 'POST',
  });
}

/** `202 verification_required` means the guest session ended; verify the email, then sign in. */
export function upgradeGuest(input: RegisterInput): Promise<ApiResult<WebRegisterResponse>> {
  return request(API_ROUTES.guestUpgrade, (value) => webRegisterResponseSchema.parse(value), {
    method: 'POST',
    body: input,
  });
}

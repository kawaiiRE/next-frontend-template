import 'server-only';
import { ClientResponseError } from 'pocketbase';
import type {
  LoginInput,
  PasswordResetConfirmInput,
  RegisterInput,
  Session,
} from '@/contracts/auth';
import type { User } from '@/contracts/user';
import type { Locale } from '@/i18n/config';
import { presentRegisteredUser, presentSession, presentUser } from '@/presenters/user';
import { ApiFailure, fieldErrorsFromPocketBase, pocketBaseErrorCode } from '@/server/http/errors';
import * as authRepository from '@/server/repositories/auth';
import { getAppConfig } from '@/server/services/config';

export interface AuthenticatedUser {
  token: string;
  user: User;
}

export type RegistrationResult =
  | ({ status: 'authenticated' } & AuthenticatedUser)
  | { status: 'verification_required'; user: User };

function isUpstreamDown(error: unknown) {
  return (
    error instanceof ClientResponseError &&
    (error.isAbort || error.status === 0 || error.status >= 500)
  );
}

export async function login(input: LoginInput): Promise<AuthenticatedUser> {
  try {
    const auth = await authRepository.authWithPassword(input.email, input.password);
    return { token: auth.token, user: presentUser(auth.record) };
  } catch (error) {
    if (error instanceof ClientResponseError && !isUpstreamDown(error)) {
      // PocketBase answers 403 for unverified accounts when verification is required.
      if (error.status === 403) throw new ApiFailure('EMAIL_NOT_VERIFIED');
      if (error.status === 429) throw new ApiFailure('RATE_LIMITED');
      if (error.status === 400 || error.status === 401 || error.status === 404) {
        throw new ApiFailure('INVALID_CREDENTIALS');
      }
    }
    throw error;
  }
}

export async function register(input: RegisterInput): Promise<RegistrationResult> {
  const config = await getAppConfig();
  if (!config.features.registration) throw new ApiFailure('REGISTRATION_DISABLED');

  let user: User;
  try {
    user = presentRegisteredUser(await authRepository.registerUser(input));
  } catch (error) {
    if (error instanceof ClientResponseError && !isUpstreamDown(error)) {
      const code = pocketBaseErrorCode(error);
      if (code === 'REGISTRATION_DISABLED') throw new ApiFailure('REGISTRATION_DISABLED');
      if (code === 'EMAIL_TAKEN' || error.status === 409) {
        throw new ApiFailure('EMAIL_TAKEN', { email: 'taken' });
      }
      if (error.status === 400) {
        throw new ApiFailure('INVALID_INPUT', fieldErrorsFromPocketBase(error));
      }
      if (error.status === 429) throw new ApiFailure('RATE_LIMITED');
    }
    throw error;
  }

  // PocketBase sends the verification email itself when verification is required.
  if (config.features.emailVerification && !user.verified) {
    return { status: 'verification_required', user };
  }

  const session = await login({ email: input.email, password: input.password });
  return { status: 'authenticated', ...session };
}

/** Starts a temporary guest session when the backend enables it. */
export async function startGuestSession(locale: Locale): Promise<AuthenticatedUser> {
  const config = await getAppConfig();
  if (!config.features.guest) throw new ApiFailure('GUEST_DISABLED');

  try {
    const auth = await authRepository.createGuest(locale);
    return { token: auth.token, user: presentUser(auth.record) };
  } catch (error) {
    if (error instanceof ClientResponseError && !isUpstreamDown(error)) {
      if (error.status === 403) throw new ApiFailure('GUEST_DISABLED');
      if (error.status === 429) throw new ApiFailure('RATE_LIMITED');
    }
    throw error;
  }
}

/**
 * Converts the signed-in guest into a regular account, keeping its notes. When the backend requires
 * email verification no session is issued: the user verifies, then signs in.
 */
export async function upgradeGuestSession(
  token: string,
  input: RegisterInput,
): Promise<RegistrationResult> {
  try {
    const result = await authRepository.upgradeGuest(token, input);
    return result.status === 'authenticated'
      ? { status: 'authenticated', token: result.auth.token, user: presentUser(result.auth.record) }
      : { status: 'verification_required', user: presentRegisteredUser(result.user) };
  } catch (error) {
    if (error instanceof ClientResponseError && !isUpstreamDown(error)) {
      const code = pocketBaseErrorCode(error);
      if (code === 'EMAIL_TAKEN' || error.status === 409) {
        throw new ApiFailure('EMAIL_TAKEN', { email: 'taken' });
      }
      if (code === 'NOT_GUEST') throw new ApiFailure('NOT_GUEST');
      if (code === 'REGISTRATION_DISABLED') throw new ApiFailure('REGISTRATION_DISABLED');
      if (error.status === 400) {
        throw new ApiFailure('INVALID_INPUT', fieldErrorsFromPocketBase(error));
      }
      if (error.status === 401 || error.status === 403) throw new ApiFailure('UNAUTHENTICATED');
      if (error.status === 429) throw new ApiFailure('RATE_LIMITED');
    }
    throw error;
  }
}

/** Issues a fresh token. Rejected or revoked tokens become `UNAUTHENTICATED`. */
export async function refresh(token: string): Promise<AuthenticatedUser> {
  try {
    const auth = await authRepository.refreshAuth(token);
    return { token: auth.token, user: presentUser(auth.record) };
  } catch (error) {
    if (error instanceof ClientResponseError && !isUpstreamDown(error)) {
      if (error.status === 429) throw new ApiFailure('RATE_LIMITED');
      if (error.status === 403) throw new ApiFailure('EMAIL_NOT_VERIFIED');
      throw new ApiFailure('UNAUTHENTICATED');
    }
    throw error;
  }
}

export function toSession({ token, user }: AuthenticatedUser): Session {
  return presentSession(token, user);
}

/** Always succeeds for well-formed input so the response never reveals whether an account exists. */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await authRepository.requestPasswordReset(email);
  } catch (error) {
    if (isUpstreamDown(error)) throw error;
  }
}

/** Resends the verification email; like password reset, it never reveals whether the account exists. */
export async function requestVerification(email: string): Promise<void> {
  try {
    await authRepository.requestVerification(email);
  } catch (error) {
    if (isUpstreamDown(error)) throw error;
  }
}

export async function confirmPasswordReset(input: PasswordResetConfirmInput): Promise<void> {
  try {
    await authRepository.confirmPasswordReset(input.token, input.password);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 400) {
      const fields = fieldErrorsFromPocketBase(error) ?? {};
      throw new ApiFailure('INVALID_INPUT', {
        ...fields,
        ...(fields.password ? {} : { token: 'invalid_token' }),
      });
    }
    throw error;
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    await authRepository.confirmVerification(token);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 400) {
      throw new ApiFailure('INVALID_INPUT', { token: 'invalid_token' });
    }
    throw error;
  }
}

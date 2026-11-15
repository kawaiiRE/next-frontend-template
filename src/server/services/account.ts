import 'server-only';
import { ClientResponseError } from 'pocketbase';
import type { ChangePasswordInput } from '@/contracts/auth';
import type { UpdateProfileInput, User } from '@/contracts/user';
import { presentUser } from '@/presenters/user';
import { ApiFailure, fieldErrorsFromPocketBase } from '@/server/http/errors';
import * as usersRepository from '@/server/repositories/users';

export interface AuthContext {
  token: string;
  userId: string;
}

/** A token PocketBase no longer accepts (revoked, deleted user) surfaces as 401/403/404. */
function asUnauthenticated(error: unknown): never {
  if (error instanceof ClientResponseError && [401, 403, 404].includes(error.status)) {
    throw new ApiFailure('UNAUTHENTICATED');
  }
  throw error;
}

export async function getAccount(auth: AuthContext): Promise<User> {
  try {
    return presentUser(await usersRepository.getUser(auth.token, auth.userId));
  } catch (error) {
    asUnauthenticated(error);
  }
}

export async function updateAccount(auth: AuthContext, input: UpdateProfileInput): Promise<User> {
  try {
    return presentUser(await usersRepository.updateUser(auth.token, auth.userId, input));
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 400) {
      throw new ApiFailure('INVALID_INPUT', fieldErrorsFromPocketBase(error));
    }
    asUnauthenticated(error);
  }
}

/** PocketBase rotates the token key on password change, invalidating every existing session. */
export async function changePassword(auth: AuthContext, input: ChangePasswordInput): Promise<void> {
  try {
    await usersRepository.changePassword(
      auth.token,
      auth.userId,
      input.currentPassword,
      input.password,
    );
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 400) {
      const fields = fieldErrorsFromPocketBase(error) ?? {};
      const { oldPassword, ...rest } = fields;
      throw new ApiFailure('INVALID_INPUT', {
        ...rest,
        ...(oldPassword ? { currentPassword: 'incorrect_password' as const } : {}),
      });
    }
    asUnauthenticated(error);
  }
}

export async function deleteAccount(auth: AuthContext): Promise<void> {
  try {
    await usersRepository.deleteUser(auth.token, auth.userId);
  } catch (error) {
    asUnauthenticated(error);
  }
}

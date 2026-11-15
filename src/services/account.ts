import type { ChangePasswordInput } from '@/contracts/auth';
import { userEnvelopeSchema, type UpdateProfileInput, type User } from '@/contracts/user';
import { API_ROUTES } from '@/constants/routes';
import { expectEmpty, request, type ApiResult } from '@/services/api';

export function updateProfile(input: UpdateProfileInput): Promise<ApiResult<User>> {
  return request(API_ROUTES.me, (value) => userEnvelopeSchema.parse(value).user, {
    method: 'PATCH',
    body: input,
  });
}

export function changePassword(input: ChangePasswordInput): Promise<ApiResult<void>> {
  return request(API_ROUTES.mePassword, expectEmpty, { method: 'POST', body: input });
}

export function deleteAccount(): Promise<ApiResult<void>> {
  return request(API_ROUTES.me, expectEmpty, { method: 'DELETE' });
}

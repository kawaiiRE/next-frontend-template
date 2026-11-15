import { z } from 'zod';

/** Stable machine-readable error codes returned by every `/api/v1` endpoint. */
export const API_ERROR_STATUS = {
  INVALID_INPUT: 400,
  UNAUTHENTICATED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN_ORIGIN: 403,
  REGISTRATION_DISABLED: 403,
  GUEST_DISABLED: 403,
  NOT_GUEST: 403,
  EMAIL_NOT_VERIFIED: 403,
  NOT_FOUND: 404,
  EMAIL_TAKEN: 409,
  BODY_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RATE_LIMITED: 429,
  INVALID_RESPONSE: 502,
  UPSTREAM_UNAVAILABLE: 503,
  UNAVAILABLE: 503,
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_STATUS;

/**
 * Field-level validation codes. Clients translate these; the gateway never returns localized text
 * inside `fields`.
 */
export const FIELD_ERROR_CODES = [
  'required',
  'invalid',
  'invalid_email',
  'too_short',
  'too_long',
  'taken',
  'invalid_token',
  'incorrect_password',
] as const;

export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];
export type FieldErrors = Record<string, FieldErrorCode>;

export function isFieldErrorCode(value: unknown): value is FieldErrorCode {
  return typeof value === 'string' && (FIELD_ERROR_CODES as readonly string[]).includes(value);
}

export const fieldErrorsSchema = z.record(
  z.string(),
  z.string().transform((value): FieldErrorCode => (isFieldErrorCode(value) ? value : 'invalid')),
);

export const apiErrorSchema = z.object({
  message: z.string().min(1),
  code: z.string().min(1),
  fields: fieldErrorsSchema.optional(),
});

export type ApiErrorBody = {
  message: string;
  code: ApiErrorCode;
  fields?: FieldErrors;
};

/** Safe, generic English messages. Clients should localize by `code`. */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_INPUT: 'The request contains invalid input.',
  UNAUTHENTICATED: 'Authentication is required.',
  INVALID_CREDENTIALS: 'The email or password is incorrect.',
  FORBIDDEN_ORIGIN: 'The request origin is not allowed.',
  REGISTRATION_DISABLED: 'Registration is currently disabled.',
  GUEST_DISABLED: 'Guest sessions are currently disabled.',
  NOT_GUEST: 'Only guest sessions can be upgraded.',
  EMAIL_NOT_VERIFIED: 'The email address has not been verified yet.',
  NOT_FOUND: 'The requested resource was not found.',
  EMAIL_TAKEN: 'An account with this email already exists.',
  BODY_TOO_LARGE: 'The request body is too large.',
  UNSUPPORTED_MEDIA_TYPE: 'The request must use application/json.',
  RATE_LIMITED: 'Too many requests. Try again later.',
  INVALID_RESPONSE: 'The backend returned an invalid response.',
  UPSTREAM_UNAVAILABLE: 'The backend is unavailable.',
  UNAVAILABLE: 'The service is temporarily unavailable.',
};

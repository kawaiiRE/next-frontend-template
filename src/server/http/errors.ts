import 'server-only';
import { ClientResponseError } from 'pocketbase';
import { ZodError, type ZodType } from 'zod';
import {
  API_ERROR_MESSAGES,
  API_ERROR_STATUS,
  isFieldErrorCode,
  type ApiErrorBody,
  type ApiErrorCode,
  type FieldErrorCode,
  type FieldErrors,
} from '@/contracts/api-error';
import { pocketBaseErrorBodySchema } from '@/contracts/pocketbase';

export class ApiFailure extends Error {
  readonly status: number;

  constructor(
    readonly code: ApiErrorCode,
    readonly fields?: FieldErrors,
    readonly headers?: Record<string, string>,
  ) {
    super(code);
    this.name = 'ApiFailure';
    this.status = API_ERROR_STATUS[code];
  }
}

/** Marks a backend response that failed schema validation (distinct from invalid client input). */
export class UpstreamContractError extends Error {
  constructor(readonly cause: ZodError) {
    super('UPSTREAM_CONTRACT');
    this.name = 'UpstreamContractError';
  }
}

/** Validates an upstream payload; a mismatch becomes `INVALID_RESPONSE`, never `INVALID_INPUT`. */
export function parseUpstream<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new UpstreamContractError(result.error);
  return result.data;
}

const ZOD_FALLBACK_CODES: Record<string, FieldErrorCode> = {
  too_small: 'too_short',
  too_big: 'too_long',
  invalid_format: 'invalid',
  invalid_type: 'required',
};

export function fieldErrorsFromZod(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join('.') : 'body';
    if (fields[key]) continue;
    fields[key] = isFieldErrorCode(issue.message)
      ? issue.message
      : (ZOD_FALLBACK_CODES[issue.code] ?? 'invalid');
  }
  return fields;
}

/** Parses untrusted client input; failures become `INVALID_INPUT` with field codes. */
export function parseInput<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new ApiFailure('INVALID_INPUT', fieldErrorsFromZod(result.error));
  return result.data;
}

const POCKETBASE_FIELD_CODES: Record<string, FieldErrorCode> = {
  validation_required: 'required',
  validation_invalid_email: 'invalid_email',
  validation_is_email: 'invalid_email',
  validation_not_unique: 'taken',
  validation_min_text_constraint: 'too_short',
  validation_length_too_short: 'too_short',
  validation_max_text_constraint: 'too_long',
  validation_length_too_long: 'too_long',
  validation_invalid_token: 'invalid_token',
  validation_invalid_token_claims: 'invalid_token',
  validation_invalid_old_password: 'incorrect_password',
};

/** Translates PocketBase validation details (`data.field.code`) into gateway field codes. */
export function fieldErrorsFromPocketBase(error: ClientResponseError): FieldErrors | undefined {
  const parsed = pocketBaseErrorBodySchema.safeParse(error.response);
  if (!parsed.success) return undefined;

  const fields: FieldErrors = {};
  for (const [key, value] of Object.entries(parsed.data.fields ?? {})) {
    fields[key] = isFieldErrorCode(value) ? value : 'invalid';
  }
  for (const [key, detail] of Object.entries(parsed.data.data ?? {})) {
    const code = detail.code ?? '';
    fields[key] = POCKETBASE_FIELD_CODES[code] ?? (isFieldErrorCode(code) ? code : 'invalid');
  }
  return Object.keys(fields).length > 0 ? fields : undefined;
}

/** Reads the stable `code` string from the template's custom PocketBase routes. */
export function pocketBaseErrorCode(error: ClientResponseError): string | undefined {
  const parsed = pocketBaseErrorBodySchema.safeParse(error.response);
  const code = parsed.success ? parsed.data.code : undefined;
  return typeof code === 'string' ? code : undefined;
}

/** Generic PocketBase -> gateway mapping. Services handle context-specific cases first. */
export function mapPocketBaseError(error: ClientResponseError): ApiFailure {
  if (error.isAbort || error.status === 0) return new ApiFailure('UPSTREAM_UNAVAILABLE');

  switch (error.status) {
    case 400:
      return new ApiFailure('INVALID_INPUT', fieldErrorsFromPocketBase(error));
    case 401:
    case 403:
      return new ApiFailure('UNAUTHENTICATED');
    case 413:
      return new ApiFailure('BODY_TOO_LARGE');
    case 404:
      return new ApiFailure('NOT_FOUND');
    case 429:
      return new ApiFailure('RATE_LIMITED');
    default:
      return new ApiFailure('UPSTREAM_UNAVAILABLE');
  }
}

export function toApiFailure(error: unknown): ApiFailure {
  if (error instanceof ApiFailure) return error;
  if (error instanceof UpstreamContractError) return new ApiFailure('INVALID_RESPONSE');
  if (error instanceof ClientResponseError) return mapPocketBaseError(error);
  if (error instanceof ZodError) return new ApiFailure('INVALID_RESPONSE');
  return new ApiFailure('UNAVAILABLE');
}

export function errorBody(failure: ApiFailure): ApiErrorBody {
  return {
    message: API_ERROR_MESSAGES[failure.code],
    code: failure.code,
    ...(failure.fields ? { fields: failure.fields } : {}),
  };
}

/** Logs only the error class/code; never messages, stacks, tokens or upstream bodies. */
export function logFailure(context: string, error: unknown, failure: ApiFailure) {
  if (failure.status < 500) return;
  const name = error instanceof Error ? error.name : 'UnknownError';
  const upstreamStatus = error instanceof ClientResponseError ? ` upstream=${error.status}` : '';
  console.error(`[api] ${context} failed: ${name} -> ${failure.code}${upstreamStatus}`);
}

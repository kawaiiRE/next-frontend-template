import { apiErrorSchema, type FieldErrors } from '@/contracts/api-error';

export interface ApiError {
  message: string;
  code: string;
  fields?: FieldErrors;
}

export type ApiResult<T> =
  { success: true; data: T; status: number } | { success: false; error: ApiError; status: number };

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
}

const INVALID_RESPONSE: ApiError = {
  code: 'INVALID_RESPONSE',
  message: 'The server returned an invalid response.',
};

/**
 * Same-origin JSON transport. Every response is validated before it reaches hooks or components;
 * transport failures and malformed payloads become safe error results instead of exceptions.
 */
export async function request<T>(
  url: string,
  parse: (value: unknown) => T,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const method = options.method ?? 'GET';
  try {
    const response = await fetch(url, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
    });

    if (response.status === 204) {
      if (!response.ok) return { success: false, error: INVALID_RESPONSE, status: response.status };
      try {
        return { success: true, data: parse(undefined), status: response.status };
      } catch {
        return { success: false, error: INVALID_RESPONSE, status: response.status };
      }
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { success: false, error: INVALID_RESPONSE, status: response.status };
    }

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(body);
      return {
        success: false,
        error: parsedError.success
          ? {
              code: parsedError.data.code,
              message: parsedError.data.message,
              ...(parsedError.data.fields ? { fields: parsedError.data.fields } : {}),
            }
          : { code: 'REQUEST_FAILED', message: 'The request failed.' },
        status: response.status,
      };
    }

    try {
      return { success: true, data: parse(body), status: response.status };
    } catch {
      return { success: false, error: INVALID_RESPONSE, status: response.status };
    }
  } catch {
    return {
      success: false,
      error: { code: 'UNAVAILABLE', message: 'The connection is unavailable.' },
      status: 0,
    };
  }
}

export const expectEmpty = (value: unknown): void => {
  if (value !== undefined) throw new Error('Expected an empty response.');
};

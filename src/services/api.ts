import { z } from 'zod';

export interface ApiError {
  message: string;
  code: string;
}

export type ApiResult<T> =
  { success: true; data: T; status: number } | { success: false; error: ApiError; status: number };

const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export async function request<T>(url: string, parse: (value: unknown) => T): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return {
        success: false,
        error: { code: 'INVALID_RESPONSE', message: 'The server returned an invalid response.' },
        status: response.status,
      };
    }

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(body);
      return {
        success: false,
        error: parsedError.success
          ? parsedError.data
          : { code: 'REQUEST_FAILED', message: 'The request failed.' },
        status: response.status,
      };
    }

    try {
      return { success: true, data: parse(body), status: response.status };
    } catch {
      return {
        success: false,
        error: { code: 'INVALID_RESPONSE', message: 'The server returned an invalid response.' },
        status: response.status,
      };
    }
  } catch {
    return {
      success: false,
      error: { code: 'UNAVAILABLE', message: 'The connection is unavailable.' },
      status: 0,
    };
  }
}

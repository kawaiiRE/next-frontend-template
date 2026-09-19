export interface ApiError {
  message: string;
  code: string;
}

export type ApiResult<T> =
  { success: true; data: T; status: number } | { success: false; error: ApiError; status: number };

export async function request<T>(url: string, parse: (value: unknown) => T): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const body: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          typeof body === 'object' && body !== null && 'code' in body && 'message' in body
            ? { code: String(body.code), message: String(body.message) }
            : { code: 'REQUEST_FAILED', message: 'The request failed.' },
        status: response.status,
      };
    }

    return { success: true, data: parse(body), status: response.status };
  } catch {
    return {
      success: false,
      error: { code: 'UNAVAILABLE', message: 'The connection is unavailable.' },
      status: 0,
    };
  }
}

import { ClientResponseError } from 'pocketbase';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ApiFailure,
  errorBody,
  fieldErrorsFromPocketBase,
  mapPocketBaseError,
  parseInput,
  parseUpstream,
  toApiFailure,
} from '../src/server/http/errors';
import { MAX_JSON_BODY_BYTES, readJsonBody } from '../src/server/http/request';

function pbError(status: number, response: Record<string, unknown> = {}, isAbort = false) {
  return new ClientResponseError({ url: 'http://pb/api', status, response, isAbort });
}

describe('PocketBase error mapping', () => {
  it.each([
    [0, 'UPSTREAM_UNAVAILABLE'],
    [400, 'INVALID_INPUT'],
    [401, 'UNAUTHENTICATED'],
    [403, 'UNAUTHENTICATED'],
    [404, 'NOT_FOUND'],
    [413, 'BODY_TOO_LARGE'],
    [429, 'RATE_LIMITED'],
    [500, 'UPSTREAM_UNAVAILABLE'],
  ] as const)('status %i -> %s', (status, code) => {
    expect(mapPocketBaseError(pbError(status)).code).toBe(code);
  });

  it('treats aborted (timed-out) requests as unavailable', () => {
    expect(mapPocketBaseError(pbError(0, {}, true)).code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('translates native validation details and custom route fields into gateway codes', () => {
    expect(
      fieldErrorsFromPocketBase(
        pbError(400, {
          status: 400,
          message: 'Failed to create record.',
          data: {
            email: { code: 'validation_not_unique', message: 'Value must be unique.' },
            name: { code: 'validation_min_text_constraint', message: 'Too short' },
            oldPassword: { code: 'validation_invalid_old_password', message: 'Invalid' },
            weird: { code: 'validation_something_new', message: '?' },
          },
        }),
      ),
    ).toEqual({
      email: 'taken',
      name: 'too_short',
      oldPassword: 'incorrect_password',
      weird: 'invalid',
    });

    expect(
      fieldErrorsFromPocketBase(
        pbError(400, {
          code: 'INVALID_INPUT',
          message: 'Invalid',
          fields: { email: 'invalid_email' },
        }),
      ),
    ).toEqual({ email: 'invalid_email' });
  });
});

describe('safe error responses', () => {
  it('never leaks internal messages', () => {
    const failure = toApiFailure(new Error('SELECT * FROM users; secret=abc'));
    expect(failure.code).toBe('UNAVAILABLE');
    expect(JSON.stringify(errorBody(failure))).not.toContain('secret');
  });

  it('distinguishes invalid client input from invalid upstream responses', () => {
    try {
      parseInput(z.object({ title: z.string().min(1, 'required') }), { title: '' });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiFailure);
      expect(errorBody(error as ApiFailure)).toEqual({
        message: 'The request contains invalid input.',
        code: 'INVALID_INPUT',
        fields: { title: 'required' },
      });
    }

    let upstreamFailure: unknown;
    try {
      parseUpstream(z.object({ id: z.string() }), { id: 1 });
    } catch (error) {
      upstreamFailure = error;
    }
    expect(toApiFailure(upstreamFailure)).toMatchObject({ code: 'INVALID_RESPONSE', status: 502 });
  });
});

describe('readJsonBody', () => {
  const post = (body: BodyInit, headers: Record<string, string>) =>
    new Request('http://localhost/api', { method: 'POST', body, headers });

  it('parses bounded JSON', async () => {
    await expect(
      readJsonBody(post('{"a":1}', { 'content-type': 'application/json' })),
    ).resolves.toEqual({ a: 1 });
  });

  it('rejects other media types, oversize and malformed bodies', async () => {
    await expect(
      readJsonBody(post('a=1', { 'content-type': 'application/x-www-form-urlencoded' })),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
    await expect(
      readJsonBody(
        post(`"${'x'.repeat(MAX_JSON_BODY_BYTES)}"`, { 'content-type': 'application/json' }),
      ),
    ).rejects.toMatchObject({ code: 'BODY_TOO_LARGE', status: 413 });
    await expect(
      readJsonBody(post('{nope', { 'content-type': 'application/json' })),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
  });
});

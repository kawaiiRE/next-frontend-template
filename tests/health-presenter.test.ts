import { describe, expect, it } from 'vitest';
import { presentHealth } from '../src/presenters/health';

describe('presentHealth', () => {
  it('returns a serializable application model', () => {
    expect(
      presentHealth({
        status: 'ok',
        apiVersion: 1,
        service: 'pocketbase-backend-template',
        time: '2026-09-19T12:00:00.000Z',
      }),
    ).toEqual({
      available: true,
      apiVersion: 1,
      service: 'pocketbase-backend-template',
      checkedAt: '2026-09-19T12:00:00.000Z',
    });
  });
});

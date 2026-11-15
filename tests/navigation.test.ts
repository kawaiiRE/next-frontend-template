import { describe, expect, it } from 'vitest';
import { breadcrumbsFor, isActivePath } from '../src/constants/navigation';
import { decideRoute, loginPathWithNext, safeNextPath } from '../src/lib/navigation';
import { paginationRange } from '../src/components/ui/Pagination/logic';

describe('safeNextPath', () => {
  it.each([
    ['/notes?archived=true', '/notes?archived=true'],
    ['/notes/abc#top', '/notes/abc#top'],
  ])('accepts %s', (value, expected) => {
    expect(safeNextPath(value)).toBe(expected);
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'notes',
    '/a\u0000b',
    '',
    null,
  ])('rejects %s', (value) => {
    expect(safeNextPath(value)).toBeNull();
  });
});

describe('route policy (proxy)', () => {
  it('sends anonymous users from protected pages to login with next', () => {
    expect(decideRoute({ pathname: '/notes/abc', search: '?x=1', hasSession: false })).toEqual({
      type: 'redirect',
      location: `/login?next=${encodeURIComponent('/notes/abc?x=1')}`,
    });
  });

  it('sends signed-in users away from signed-out pages, honouring a safe next', () => {
    expect(decideRoute({ pathname: '/login', search: '', hasSession: true })).toEqual({
      type: 'redirect',
      location: '/dashboard',
    });
    expect(
      decideRoute({ pathname: '/login', search: '?next=%2Fsettings', hasSession: true }),
    ).toEqual({
      type: 'redirect',
      location: '/settings',
    });
    expect(
      decideRoute({
        pathname: '/register',
        search: '?next=https://evil.example',
        hasSession: true,
      }),
    ).toEqual({
      type: 'redirect',
      location: '/dashboard',
    });
  });

  it('leaves public and token pages alone', () => {
    for (const pathname of ['/', '/reset-password', '/verify-email', '/notesy']) {
      expect(decideRoute({ pathname, search: '', hasSession: false })).toEqual({
        type: 'continue',
      });
    }
    expect(decideRoute({ pathname: '/verify-email', search: '', hasSession: true })).toEqual({
      type: 'continue',
    });
  });

  it('never loops login onto itself', () => {
    expect(loginPathWithNext('/login')).toBe('/login');
  });

  it('adds the session-expired notice when a stale cookie was dropped', () => {
    expect(
      decideRoute({ pathname: '/settings', search: '', hasSession: false, sessionExpired: true }),
    ).toEqual({ type: 'redirect', location: '/login?next=%2Fsettings&notice=session-expired' });
    expect(loginPathWithNext(null, 'account-deleted')).toBe('/login?notice=account-deleted');
  });
});

describe('navigation helpers', () => {
  it('marks nested routes active without prefix collisions', () => {
    expect(isActivePath('/notes/abc', '/notes')).toBe(true);
    expect(isActivePath('/notesy', '/notes')).toBe(false);
  });

  it('derives breadcrumbs for note routes', () => {
    expect(breadcrumbsFor('/notes/abc/edit').map((crumb) => crumb.key)).toEqual([
      'notes',
      'note',
      'editNote',
    ]);
    expect(breadcrumbsFor('/notes/new').map((crumb) => crumb.key)).toEqual(['notes', 'newNote']);
    expect(breadcrumbsFor('/')).toEqual([]);
  });

  it('keeps pagination compact with ellipses', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(10, 65)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 65]);
    expect(paginationRange(2, 65)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 65]);
    expect(paginationRange(1, 0)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { presentNote, presentNotesPage, presentNoteView } from '../src/presenters/note';
import {
  presentRegisteredUser,
  presentSession,
  presentUser,
  presentUserView,
} from '../src/presenters/user';
import { fakeToken } from './support/tokens';

const pbNote = {
  id: 'note00000000001',
  owner: 'user00000000001',
  title: 'Title',
  body: 'Body',
  archived: false,
  created: '2026-01-31T12:00:00.000Z',
  updated: '2026-01-31T12:00:00.000Z',
};

describe('note presenters', () => {
  it('allowlists gateway fields and drops the owner', () => {
    const note = presentNote(pbNote);
    expect(note).toEqual({
      id: pbNote.id,
      title: 'Title',
      body: 'Body',
      archived: false,
      createdAt: pbNote.created,
      updatedAt: pbNote.updated,
    });
    expect(note).not.toHaveProperty('owner');
  });

  it('clamps PocketBase skipTotal sentinels in pages', () => {
    expect(
      presentNotesPage({ page: 1, perPage: 20, totalItems: -1, totalPages: -1, items: [pbNote] }),
    ).toMatchObject({
      totalItems: 0,
      totalPages: 0,
    });
  });

  it('builds grapheme-safe excerpts and detects edits', () => {
    const view = presentNoteView({
      ...presentNote(pbNote),
      body: `${'👩🏽‍💻 '.repeat(10)}${'word '.repeat(100)}`,
      updatedAt: '2026-02-01T12:00:00.000Z',
    });
    expect(view.excerpt.endsWith('…')).toBe(true);
    expect(view.excerpt).not.toMatch(/�/);
    expect(view.wasEdited).toBe(true);
    expect(presentNoteView({ ...presentNote(pbNote), body: '  a\n\n b ' }).excerpt).toBe('a b');
  });
});

describe('user presenters', () => {
  it('presents users and registered users', () => {
    expect(
      presentUser({
        id: 'u',
        email: 'a@b.co',
        name: 'A',
        verified: true,
        guest: false,
        locale: 'ar',
        created: '2026-01-31T12:00:00.000Z',
      }),
    ).toEqual({
      id: 'u',
      email: 'a@b.co',
      name: 'A',
      verified: true,
      isGuest: false,
      locale: 'ar',
      createdAt: '2026-01-31T12:00:00.000Z',
    });
    expect(
      presentRegisteredUser({
        id: 'u',
        email: 'a@b.co',
        name: 'A',
        verified: false,
        guest: false,
        locale: null,
        createdAt: '2026-01-31T12:00:00.000Z',
      }),
    ).toMatchObject({ isGuest: false, locale: null });
  });

  it('derives the session expiry from the token', () => {
    const token = fakeToken({ expiresInSeconds: 3600 });
    const session = presentSession(token, {
      id: 'u',
      email: 'a@b.co',
      name: 'A',
      verified: true,
      isGuest: false,
      locale: null,
      createdAt: '2026-01-31T12:00:00.000Z',
    });
    expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
  });

  it('falls back to the email for display name and initials', () => {
    const view = presentUserView(
      {
        id: 'u',
        email: 'sam.lee@example.com',
        name: '  ',
        verified: true,
        isGuest: false,
        locale: null,
        createdAt: '2026-01-31T12:00:00.000Z',
      },
      'Guest',
    );
    expect(view.displayName).toBe('sam.lee@example.com');
    expect(view.initials).toBe('SL');
  });

  it('shows guests with the localized guest name and hides the generated email', () => {
    const view = presentUserView(
      {
        id: 'g',
        email: 'guest-k2x7c0d9a1b3e5f@guest.invalid',
        name: 'Guest k2x7',
        verified: true,
        isGuest: true,
        locale: null,
        createdAt: '2026-01-31T12:00:00.000Z',
      },
      'Guest',
    );
    expect(view).toMatchObject({ displayName: 'Guest', email: '', name: '', initials: null });
    expect(view.isGuest).toBe(true);
  });
});

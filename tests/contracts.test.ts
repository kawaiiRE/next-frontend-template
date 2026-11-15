import { describe, expect, it } from 'vitest';
import {
  changePasswordInputSchema,
  loginInputSchema,
  registerInputSchema,
  sessionSchema,
  tokenRegisterResponseSchema,
  webRegisterResponseSchema,
} from '../src/contracts/auth';
import { appConfigSchema } from '../src/contracts/config';
import {
  createNoteInputSchema,
  noteSchema,
  notesPageSchema,
  notesQuerySchema,
  parseNotesSearchParams,
  updateNoteInputSchema,
} from '../src/contracts/note';
import {
  pocketBaseDateSchema,
  pocketBaseNoteSchema,
  pocketBaseUserSchema,
} from '../src/contracts/pocketbase';
import { updateProfileInputSchema, userSchema } from '../src/contracts/user';

const user = {
  id: 'user00000000001',
  email: 'jane@example.com',
  name: 'Jane',
  verified: true,
  isGuest: false,
  locale: 'ar',
  createdAt: '2026-01-31T12:00:00.000Z',
};

describe('gateway DTO contracts', () => {
  it('accepts the documented User, Note, Session and Page shapes', () => {
    expect(userSchema.parse(user)).toEqual(user);
    expect(userSchema.parse({ ...user, locale: null }).locale).toBeNull();
    expect(() => userSchema.parse({ ...user, locale: 'fr' })).toThrow();

    const note = {
      id: 'note00000000001',
      title: 'Title',
      body: '',
      archived: false,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    };
    expect(noteSchema.parse(note)).toEqual(note);
    expect(
      notesPageSchema.parse({ items: [note], page: 1, perPage: 20, totalItems: 1, totalPages: 1 })
        .items,
    ).toHaveLength(1);
    expect(sessionSchema.parse({ token: 'a.b.c', expiresAt: user.createdAt, user }).user.id).toBe(
      user.id,
    );
  });

  it('uses a discriminated union for both register responses', () => {
    expect(webRegisterResponseSchema.parse({ status: 'verification_required', user }).status).toBe(
      'verification_required',
    );
    expect(
      tokenRegisterResponseSchema.parse({
        status: 'authenticated',
        session: { token: 'a.b.c', expiresAt: user.createdAt, user },
      }).status,
    ).toBe('authenticated');
    expect(() => tokenRegisterResponseSchema.parse({ status: 'authenticated', user })).toThrow();
  });

  it('pins the config contract to apiVersion 1', () => {
    expect(
      appConfigSchema.parse({
        apiVersion: 1,
        features: { registration: true, emailVerification: false, guest: true, guestTtlHours: 6 },
      }).features,
    ).toEqual({ registration: true, emailVerification: false, guest: true, guestTtlHours: 6 });
    expect(() =>
      appConfigSchema.parse({
        apiVersion: 2,
        features: { registration: true, emailVerification: false },
      }),
    ).toThrow();
  });

  it('treats a backend without guest support as guests disabled', () => {
    expect(
      appConfigSchema.parse({
        apiVersion: 1,
        features: { registration: true, emailVerification: false },
      }).features,
    ).toMatchObject({ guest: false, guestTtlHours: 24 });
  });
});

describe('input validation', () => {
  it('reports stable field codes as issue messages', () => {
    const result = registerInputSchema.safeParse({ name: ' a ', email: 'nope', password: 'short' });
    expect(result.success).toBe(false);
    const messages = Object.fromEntries(
      result.error!.issues.map((issue) => [issue.path[0], issue.message]),
    );
    expect(messages).toEqual({ name: 'too_short', email: 'invalid_email', password: 'too_short' });
  });

  it('limits new passwords to 71 UTF-8 bytes, not characters', () => {
    expect(
      registerInputSchema.safeParse({
        name: 'Jane',
        email: 'j@example.com',
        password: 'a'.repeat(71),
      }).success,
    ).toBe(true);
    expect(
      registerInputSchema.safeParse({
        name: 'Jane',
        email: 'j@example.com',
        password: 'a'.repeat(72),
      }).success,
    ).toBe(false);
    // 36 Arabic letters = 72 bytes.
    expect(
      registerInputSchema.safeParse({
        name: 'Jane',
        email: 'j@example.com',
        password: 'ب'.repeat(36),
      }).success,
    ).toBe(false);
  });

  it('never applies the new-password policy to login', () => {
    expect(loginInputSchema.safeParse({ email: 'j@example.com', password: 'x' }).success).toBe(
      true,
    );
    expect(
      changePasswordInputSchema.safeParse({ currentPassword: 'x', password: 'long-enough' })
        .success,
    ).toBe(true);
  });

  it('trims and bounds note input and rejects unknown keys', () => {
    expect(createNoteInputSchema.parse({ title: '  Hello  ' })).toEqual({
      title: 'Hello',
      body: '',
    });
    expect(createNoteInputSchema.safeParse({ title: '   ' }).success).toBe(false);
    expect(createNoteInputSchema.safeParse({ title: 'x'.repeat(161) }).success).toBe(false);
    expect(createNoteInputSchema.safeParse({ title: 'ok', owner: 'someone-else' }).success).toBe(
      false,
    );
    expect(updateNoteInputSchema.safeParse({}).success).toBe(false);
    expect(updateNoteInputSchema.parse({ archived: true })).toEqual({ archived: true });
  });

  it('requires at least one profile field', () => {
    expect(updateProfileInputSchema.safeParse({}).success).toBe(false);
    expect(updateProfileInputSchema.parse({ locale: null })).toEqual({ locale: null });
  });

  it('parses notes queries strictly for the API and leniently for pages', () => {
    expect(notesQuerySchema.parse({})).toEqual({
      page: 1,
      perPage: 20,
      search: '',
      archived: false,
    });
    expect(
      notesQuerySchema.parse({ page: '3', perPage: '50', search: ' q ', archived: 'true' }),
    ).toEqual({
      page: 3,
      perPage: 50,
      search: 'q',
      archived: true,
    });
    expect(notesQuerySchema.safeParse({ perPage: '500' }).success).toBe(false);
    expect(
      parseNotesSearchParams({ page: '-4', perPage: '500', archived: 'maybe', search: ['a', 'b'] }),
    ).toEqual({
      page: 1,
      perPage: 20,
      search: 'a',
      archived: false,
    });
  });
});

describe('PocketBase DTO normalisation', () => {
  it('normalises PocketBase timestamps to ISO-8601', () => {
    expect(pocketBaseDateSchema.parse('2026-01-31 12:00:00.123Z')).toBe('2026-01-31T12:00:00.123Z');
    expect(pocketBaseDateSchema.safeParse('not a date').success).toBe(false);
  });

  it('maps empty select values to null and defaults missing optional fields', () => {
    const record = pocketBaseUserSchema.parse({
      id: 'u1',
      email: 'a@b.co',
      verified: false,
      locale: '',
      created: '2026-01-31 12:00:00.000Z',
      tokenKey: 'never-exposed',
    });
    expect(record).toEqual({
      id: 'u1',
      email: 'a@b.co',
      name: '',
      verified: false,
      guest: false,
      locale: null,
      created: '2026-01-31T12:00:00.000Z',
    });
    expect(
      pocketBaseNoteSchema.parse({
        id: 'n',
        owner: 'u',
        title: 't',
        created: '2026-01-31 12:00:00.000Z',
        updated: '2026-01-31 12:00:00.000Z',
      }).archived,
    ).toBe(false);
  });
});

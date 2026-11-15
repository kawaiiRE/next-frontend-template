import { describe, expect, it } from 'vitest';
import { noteSchema } from '../src/contracts/note';
import { userSchema } from '../src/contracts/user';
import { initialsFor } from '../src/lib/initials';
import { presentNoteView } from '../src/presenters/note';
import { presentUserView } from '../src/presenters/user';
import { WORST_CASE_NOTES, WORST_CASE_USERS } from './support/fixtures';

describe('initials', () => {
  it.each([
    ['Aleksandra Wiśniewska-Kowalczyk', 'AW'],
    ['Christopher Alexander Montgomery III', 'CM'],
    ['Jo', 'J'],
    ['dana', 'D'],
    ['Ólafur Darri Ólafsson', 'ÓÓ'],
    ['王秀英', '王'],
    ['نور الهدى عبد الرحمن', 'نا'],
    ['🦊 Fox', 'F'],
    ['  Sam   Lee ', 'SL'],
  ])('%s -> %s', (name, expected) => {
    expect(initialsFor(name)).toBe(expected);
  });

  it('returns null when nothing readable exists so the UI shows an icon', () => {
    expect(initialsFor('🦊 🐼')).toBeNull();
    expect(initialsFor('', '')).toBeNull();
  });
});

describe('worst-case fixtures', () => {
  it('are valid gateway DTOs', () => {
    for (const note of WORST_CASE_NOTES) expect(noteSchema.safeParse(note).success).toBe(true);
    for (const user of WORST_CASE_USERS) expect(userSchema.safeParse(user).success).toBe(true);
  });

  it('present without losing data or producing broken characters', () => {
    for (const note of WORST_CASE_NOTES) {
      const view = presentNoteView(note);
      expect(view.excerpt).not.toMatch(/�/);
      expect(view.title).toBe(note.title.trim());
    }
    for (const user of WORST_CASE_USERS) {
      const view = presentUserView(user, 'Guest');
      expect(view.displayName.length).toBeGreaterThan(0);
      if (view.initials) expect(view.initials).not.toMatch(/�/);
    }
  });
});

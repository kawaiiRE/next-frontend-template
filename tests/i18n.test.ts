import { describe, expect, it } from 'vitest';
import { matchAcceptLanguage, resolveLocale } from '../src/i18n/config';
import ar from '../src/messages/ar.json';
import en from '../src/messages/en.json';

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>((result, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string'
      ? { ...result, [path]: value }
      : { ...result, ...flatten(value, path) };
  }, {});
}

/** Top-level ICU argument names (`{name}`, `{count, plural, ...}`), ignoring plural branches. */
function argumentsOf(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let index = 0; index < message.length; index += 1) {
    const char = message[index];
    if (char === '{') {
      if (depth === 0) {
        const match = /^\{\s*([A-Za-z_][\w]*)/.exec(message.slice(index));
        if (match?.[1]) names.add(match[1]);
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    }
  }
  return [...names].sort();
}

const english = flatten(en as Messages);
const arabic = flatten(ar as Messages);

describe('message catalogues', () => {
  it('have identical keys in English and Arabic', () => {
    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
  });

  it('use the same ICU arguments in both languages', () => {
    for (const key of Object.keys(english)) {
      expect({ key, args: argumentsOf(arabic[key] ?? '') }).toEqual({
        key,
        args: argumentsOf(english[key] ?? ''),
      });
    }
  });

  it('contain no empty strings and translate the Arabic catalogue', () => {
    for (const [key, value] of Object.entries(arabic))
      expect({ key, empty: value.trim() === '' }).toEqual({ key, empty: false });
    const untranslated = Object.keys(english).filter(
      (key) => english[key] === arabic[key] && /[a-z]{4,}/i.test(english[key] ?? ''),
    );
    expect(untranslated).toEqual([]);
  });

  it('provide every Arabic plural category for counts', () => {
    for (const category of ['zero', 'one', 'two', 'few', 'many', 'other']) {
      expect(arabic['notes.count']).toContain(`${category} {`);
    }
  });
});

describe('locale resolution', () => {
  it('prefers the cookie, then Accept-Language, then English', () => {
    expect(resolveLocale('ar', 'en-US')).toBe('ar');
    expect(resolveLocale(undefined, 'fr-FR, ar-EG;q=0.8, en;q=0.5')).toBe('ar');
    expect(resolveLocale('xx', 'de-DE')).toBe('en');
  });

  it('respects quality values and ignores q=0', () => {
    expect(matchAcceptLanguage('en;q=0.4, ar;q=0.9')).toBe('ar');
    expect(matchAcceptLanguage('ar;q=0, en;q=0.1')).toBe('en');
    expect(matchAcceptLanguage('')).toBeNull();
  });
});

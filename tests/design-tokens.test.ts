import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COLOR_TOKEN_PROPERTIES, COLOR_TOKENS } from '../src/styles/tokens';

const palette = readFileSync(
  fileURLToPath(new URL('../src/styles/palette.scss', import.meta.url)),
  'utf8',
);

function mixinBody(name: string) {
  const start = palette.indexOf(`@mixin ${name}`);
  const end = palette.indexOf('\n}\n', start);
  return palette.slice(start, end);
}

describe('design tokens', () => {
  it.each(['light', 'dark'] as const)('mirror palette.scss for the %s theme', (theme) => {
    const body = mixinBody(`${theme}-tokens`);
    for (const [token, property] of Object.entries(COLOR_TOKEN_PROPERTIES)) {
      const value = COLOR_TOKENS[theme][token as keyof (typeof COLOR_TOKENS)['light']];
      expect(body).toContain(`${property}: ${value};`);
    }
  });

  it('define the same custom properties for light and dark', () => {
    const names = (body: string) =>
      [...body.matchAll(/(--[\w-]+):/g)].map((match) => match[1]).sort();
    expect(names(mixinBody('dark-tokens'))).toEqual(names(mixinBody('light-tokens')));
  });
});

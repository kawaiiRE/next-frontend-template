const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

function firstGrapheme(word: string): string {
  if (segmenter) {
    for (const { segment } of segmenter.segment(word)) return segment;
    return '';
  }
  return Array.from(word)[0] ?? '';
}

/** Letters or digits in any script; excludes emoji and punctuation so initials stay readable. */
const LETTER = /[\p{L}\p{N}]/u;
const NAME_SUFFIX = /^(jr|sr|ii|iii|iv|phd|md)\.?$/i;

/**
 * Initials from the first and last word, grapheme-safe (emoji, combining marks, Arabic) and
 * upper-cased per locale. Returns `null` when no readable letter exists so callers can show an icon.
 */
export function initialsFor(
  name: string | null | undefined,
  fallback?: string | null,
): string | null {
  const trimmedName = (name ?? '').trim();
  // Names split on whitespace only (hyphenated surnames stay one word); email local parts on . _ - +
  const source = trimmedName || (fallback ?? '').split('@')[0]?.trim() || '';
  const words = source
    .split(trimmedName ? /\s+/u : /[\s._+-]+/u)
    .map((word) => word.trim())
    .filter((word) => word && LETTER.test(firstGrapheme(word)));

  while (words.length > 2 && NAME_SUFFIX.test(words[words.length - 1] ?? '')) words.pop();
  if (words.length === 0) return null;

  const first = firstGrapheme(words[0] ?? '');
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1] ?? '') : '';
  return `${first}${last}`.toLocaleUpperCase();
}

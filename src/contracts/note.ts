import { z } from 'zod';
import { pageSchema } from './page.ts';

export const NOTE_TITLE_MAX_LENGTH = 160;
export const NOTE_BODY_MAX_LENGTH = 20_000;
export const NOTES_DEFAULT_PER_PAGE = 20;
export const NOTES_MAX_PER_PAGE = 100;
export const NOTES_SEARCH_MAX_LENGTH = 100;

/** PocketBase record ids: 15 lowercase alphanumerics. Anything else can never exist. */
export const recordIdSchema = z.string().regex(/^[a-z0-9]{15}$/);

/** Gateway `Note` DTO (`/api/v1`). */
export const noteSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  body: z.string(),
  archived: z.boolean(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type Note = z.infer<typeof noteSchema>;

export const notesPageSchema = pageSchema(noteSchema);
export type NotesPage = z.infer<typeof notesPageSchema>;

const titleSchema = z
  .string({ error: 'required' })
  .trim()
  .min(1, 'required')
  .max(NOTE_TITLE_MAX_LENGTH, 'too_long');
const bodySchema = z.string().max(NOTE_BODY_MAX_LENGTH, 'too_long');

export const createNoteInputSchema = z
  .object({ title: titleSchema, body: bodySchema.default('') })
  .strict();
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;

export const updateNoteInputSchema = z
  .object({
    title: titleSchema.optional(),
    body: bodySchema.optional(),
    archived: z.boolean({ error: 'invalid' }).optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'required',
    path: ['title'],
  });
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;

/** Strict query parsing for the API. */
export const notesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  perPage: z.coerce.number().int().min(1).max(NOTES_MAX_PER_PAGE).default(NOTES_DEFAULT_PER_PAGE),
  search: z.string().trim().max(NOTES_SEARCH_MAX_LENGTH, 'too_long').default(''),
  archived: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});
export type NotesQuery = z.infer<typeof notesQuerySchema>;

/** Lenient parsing for page URLs: invalid values fall back to defaults instead of failing. */
export function parseNotesSearchParams(params: Record<string, string | string[] | undefined>) {
  const single = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return {
    page: notesQuerySchema.shape.page.catch(1).parse(single(params.page)),
    perPage: notesQuerySchema.shape.perPage
      .catch(NOTES_DEFAULT_PER_PAGE)
      .parse(single(params.perPage)),
    search: notesQuerySchema.shape.search.catch('').parse(single(params.search)),
    archived: notesQuerySchema.shape.archived.catch(false).parse(single(params.archived)),
  } satisfies NotesQuery;
}

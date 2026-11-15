import { z } from 'zod';
import { LOCALES } from '../i18n/config.ts';

/**
 * Raw PocketBase response DTOs. Only server repositories and the live integration script use these;
 * they never cross the gateway boundary.
 */

/** PocketBase serialises dates as `2026-01-31 12:00:00.000Z`; normalise to ISO-8601. */
export const pocketBaseDateSchema = z.string().transform((value, context) => {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    context.addIssue({ code: 'custom', message: 'Invalid PocketBase date.' });
    return z.NEVER;
  }
  return date.toISOString();
});

/** Empty select/text values arrive as `""`. */
const pocketBaseLocaleSchema = z
  .union([z.enum(LOCALES), z.literal(''), z.null()])
  .optional()
  .transform((value) => (value ? value : null));

export const pocketBaseUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(3),
  name: z.string().default(''),
  verified: z.boolean(),
  guest: z.boolean().default(false),
  locale: pocketBaseLocaleSchema,
  created: pocketBaseDateSchema,
});
export type PocketBaseUser = z.infer<typeof pocketBaseUserSchema>;

export const pocketBaseAuthSchema = z.object({
  token: z.string().min(1),
  record: pocketBaseUserSchema,
});
export type PocketBaseAuth = z.infer<typeof pocketBaseAuthSchema>;

/** Custom `POST /api/v1/auth/register` response. */
export const pocketBaseRegisteredUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(3),
  name: z.string(),
  verified: z.boolean(),
  guest: z.boolean().default(false),
  locale: pocketBaseLocaleSchema,
  createdAt: pocketBaseDateSchema,
});
export type PocketBaseRegisteredUser = z.infer<typeof pocketBaseRegisteredUserSchema>;

export const pocketBaseNoteSchema = z.object({
  id: z.string().min(1),
  owner: z.string().min(1),
  title: z.string(),
  body: z.string().default(''),
  archived: z.boolean().default(false),
  created: pocketBaseDateSchema,
  updated: pocketBaseDateSchema,
});
export type PocketBaseNote = z.infer<typeof pocketBaseNoteSchema>;

export function pocketBaseListSchema<T extends z.ZodType>(item: T) {
  return z.object({
    page: z.number().int().min(1),
    perPage: z.number().int().min(1),
    totalItems: z.number().int().min(-1),
    totalPages: z.number().int().min(-1),
    items: z.array(item),
  });
}

/** Error body shape of PocketBase native APIs and the template's custom routes. */
export const pocketBaseErrorBodySchema = z
  .object({
    code: z.union([z.string(), z.number()]).optional(),
    message: z.string().optional(),
    data: z.record(z.string(), z.object({ code: z.string().optional() }).loose()).optional(),
    fields: z.record(z.string(), z.string()).optional(),
  })
  .loose();

import { z } from 'zod';
import { LOCALES } from '../i18n/config.ts';

export const localeSchema = z.enum(LOCALES);

/** Gateway `User` DTO (`/api/v1`). */
export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(3),
  name: z.string(),
  verified: z.boolean(),
  isGuest: z.boolean(),
  locale: localeSchema.nullable(),
  createdAt: z.iso.datetime({ offset: true }),
});

export type User = z.infer<typeof userSchema>;

export const userEnvelopeSchema = z.object({ user: userSchema });

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 120;

export const nameSchema = z
  .string({ error: 'required' })
  .trim()
  .min(1, 'required')
  .min(NAME_MIN_LENGTH, 'too_short')
  .max(NAME_MAX_LENGTH, 'too_long');

export const updateProfileInputSchema = z
  .object({
    name: nameSchema.optional(),
    locale: localeSchema.nullable().optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.locale !== undefined, {
    message: 'required',
    path: ['name'],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

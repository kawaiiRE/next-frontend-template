import { z } from 'zod';

export const mailCollections = ['users', '_superusers'] as const;
export const mailTokenSchema = z
  .string()
  .min(20)
  .max(4096)
  .regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
const link = { collection: z.enum(mailCollections), token: mailTokenSchema };
const password = z.string().min(8).max(72);
export const mailLinkSchema = z
  .object({ ...link, action: z.enum(['verification', 'password-reset', 'email-change']) })
  .strict();
export const mailActionSchema = z
  .discriminatedUnion('action', [
    z.object({ ...link, action: z.literal('verification') }).strict(),
    z
      .object({ ...link, action: z.literal('password-reset'), password, passwordConfirm: password })
      .strict(),
    z.object({ ...link, action: z.literal('email-change'), password }).strict(),
  ])
  .superRefine((input, context) => {
    if (input.action === 'password-reset' && input.password !== input.passwordConfirm)
      context.addIssue({
        code: 'custom',
        path: ['passwordConfirm'],
        message: 'Passwords must match.',
      });
  });
export const mailActionResultSchema = z.object({ completed: z.literal(true) }).strict();
export const mailActionErrorSchema = z
  .object({
    code: z.enum([
      'FORBIDDEN_ORIGIN',
      'UNSUPPORTED_MEDIA_TYPE',
      'BODY_TOO_LARGE',
      'INVALID_INPUT',
      'LINK_INVALID',
      'RATE_LIMITED',
      'UNAVAILABLE',
    ]),
    message: z.string(),
  })
  .strict();
export type MailLink = z.infer<typeof mailLinkSchema>;
export type MailAction = z.infer<typeof mailActionSchema>;
export type MailActionResult = z.infer<typeof mailActionResultSchema>;
export type MailActionError = z.infer<typeof mailActionErrorSchema>;

import { z } from 'zod';
import { localeSchema, nameSchema, userSchema } from './user.ts';

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt only reads 72 bytes; PocketBase accepts at most 71 UTF-8 bytes. */
export const PASSWORD_MAX_BYTES = 71;

export const emailSchema = z
  .string({ error: 'required' })
  .trim()
  .min(1, 'required')
  .max(EMAIL_MAX_LENGTH, 'too_long')
  .pipe(z.email({ error: 'invalid_email' }));

/** Policy for new passwords. Login accepts any non-empty password so policy changes never lock users out. */
export const newPasswordSchema = z
  .string({ error: 'required' })
  .min(1, 'required')
  .min(PASSWORD_MIN_LENGTH, 'too_short')
  .refine((value) => utf8ByteLength(value) <= PASSWORD_MAX_BYTES, 'too_long');

function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

const currentPasswordSchema = z
  .string({ error: 'required' })
  .min(1, 'required')
  .max(256, 'too_long');
const tokenSchema = z
  .string({ error: 'invalid_token' })
  .trim()
  .min(1, 'invalid_token')
  .max(2048, 'invalid_token');

export const loginInputSchema = z.object({ email: emailSchema, password: currentPasswordSchema });
export type LoginInput = z.infer<typeof loginInputSchema>;

/** Also the guest upgrade body. `locale` is optional; gateways fill it from the request. */
export const registerInputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
  locale: localeSchema.optional(),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const passwordResetRequestSchema = z.object({ email: emailSchema });
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const verificationRequestSchema = z.object({ email: emailSchema });

export const passwordResetConfirmSchema = z.object({
  token: tokenSchema,
  password: newPasswordSchema,
});
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;

export const verifyEmailInputSchema = z.object({ token: tokenSchema });

export const changePasswordInputSchema = z.object({
  currentPassword: currentPasswordSchema,
  password: newPasswordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

/** Bearer session issued to native clients. */
export const sessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
  user: userSchema,
});
export type Session = z.infer<typeof sessionSchema>;

/** `POST /api/v1/auth/register` (web, cookie). */
export const webRegisterResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('authenticated'), user: userSchema }),
  z.object({ status: z.literal('verification_required'), user: userSchema }),
]);
export type WebRegisterResponse = z.infer<typeof webRegisterResponseSchema>;

/** `POST /api/v1/auth/token/register` (native, bearer). */
export const tokenRegisterResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('authenticated'), session: sessionSchema }),
  z.object({ status: z.literal('verification_required'), user: userSchema }),
]);
export type TokenRegisterResponse = z.infer<typeof tokenRegisterResponseSchema>;

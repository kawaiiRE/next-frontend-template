import { z } from 'zod';

export const API_VERSION = 1;

/** `GET /api/v1/config` — identical shape in PocketBase and the gateway. */
export const appConfigSchema = z.object({
  apiVersion: z.literal(API_VERSION),
  features: z.object({
    registration: z.boolean(),
    emailVerification: z.boolean(),
    /** Added in the guest-session release; older backends omit it, which means disabled. */
    guest: z.boolean().default(false),
    /** Hours until an idle guest account and its data are deleted. */
    guestTtlHours: z.number().positive().default(24),
  }),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

/** Used by pages when the backend cannot be reached: everything optional stays closed. */
export const FALLBACK_APP_CONFIG: AppConfig = {
  apiVersion: API_VERSION,
  features: { registration: false, emailVerification: false, guest: false, guestTtlHours: 24 },
};

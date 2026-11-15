import 'server-only';
import { z } from 'zod';

const httpUrl = z.url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'http:' || protocol === 'https:';
}, 'Expected an HTTP(S) URL.');

const environmentSchema = z.object({
  POCKETBASE_URL: httpUrl,
  APP_ORIGIN: httpUrl.transform((value) => new URL(value).origin),
  /**
   * Header carrying the client IP set by the trusted reverse proxy (rate limiting only).
   * Leave unset to use the rightmost `X-Forwarded-For` entry.
   */
  CLIENT_IP_HEADER: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

let cached: { source: string; value: Environment } | null = null;

export function environment(): Environment {
  const source = `${process.env.POCKETBASE_URL}|${process.env.APP_ORIGIN}|${process.env.CLIENT_IP_HEADER}`;
  if (cached?.source !== source) {
    cached = {
      source,
      value: environmentSchema.parse({
        POCKETBASE_URL: process.env.POCKETBASE_URL,
        APP_ORIGIN: process.env.APP_ORIGIN,
        CLIENT_IP_HEADER: process.env.CLIENT_IP_HEADER || undefined,
      }),
    };
  }
  return cached.value;
}

export function isSecureDeployment(): boolean {
  return environment().APP_ORIGIN.startsWith('https:');
}

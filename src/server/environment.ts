import 'server-only';
import { z } from 'zod';

const httpUrl = z.url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === 'http:' || protocol === 'https:';
}, 'Expected an HTTP(S) URL.');

const environmentSchema = z.object({
  POCKETBASE_URL: httpUrl,
  APP_ORIGIN: httpUrl.transform((value) => new URL(value).origin),
});

export function environment() {
  return environmentSchema.parse(process.env);
}

import 'server-only';
import { z } from 'zod';

const environmentSchema = z.object({
  POCKETBASE_URL: z.url(),
  APP_ORIGIN: z.url(),
});

export function environment() {
  return environmentSchema.parse(process.env);
}

import { z } from 'zod';

export const POCKETBASE_HEALTH_PATH = '/api/v1/health';
export const POCKETBASE_API_VERSION = 1;

export const pocketBaseHealthSchema = z.object({
  status: z.literal('ok'),
  apiVersion: z.literal(POCKETBASE_API_VERSION),
  service: z.string().min(1),
  time: z.iso.datetime(),
});

export type PocketBaseHealthDto = z.infer<typeof pocketBaseHealthSchema>;

export const healthViewModelSchema = z.object({
  available: z.boolean(),
  apiVersion: z.literal(POCKETBASE_API_VERSION),
  service: z.string().min(1),
  checkedAt: z.string().min(1),
});

export type HealthViewModel = z.infer<typeof healthViewModelSchema>;

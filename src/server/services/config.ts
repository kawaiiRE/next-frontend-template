import 'server-only';
import { cache } from 'react';
import { FALLBACK_APP_CONFIG, type AppConfig } from '@/contracts/config';
import { readPocketBaseConfig } from '@/server/repositories/config';

const CONFIG_TTL_MS = 60_000;
const FAILURE_TTL_MS = 10_000;

// Public, user-independent feature flags: safe to share across requests for a short time.
let cached: { value: AppConfig; expiresAt: number } | null = null;
let lastFailureAt = 0;

export async function getAppConfig(): Promise<AppConfig> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  try {
    const value = await readPocketBaseConfig();
    cached = { value, expiresAt: Date.now() + CONFIG_TTL_MS };
    return value;
  } catch (error) {
    lastFailureAt = Date.now();
    throw error;
  }
}

/**
 * For rendering: an unreachable backend keeps optional features (registration) closed. Failures
 * are remembered briefly so pages don't wait on a down backend for every render.
 */
export const getAppConfigOrFallback = cache(async (): Promise<AppConfig> => {
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (Date.now() - lastFailureAt < FAILURE_TTL_MS) return FALLBACK_APP_CONFIG;
  try {
    return await getAppConfig();
  } catch {
    return FALLBACK_APP_CONFIG;
  }
});

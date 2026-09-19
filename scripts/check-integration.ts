import {
  POCKETBASE_HEALTH_PATH,
  healthViewModelSchema,
  pocketBaseHealthSchema,
} from '../src/contracts/health.ts';

const REQUEST_TIMEOUT_MS = 5_000;

function baseUrl(value: string, variableName: string): URL {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${variableName} must use HTTP or HTTPS.`);
  }

  return url;
}

async function readJson(url: URL, serviceName: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`${serviceName} returned HTTP ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
}

async function checkIntegration(): Promise<void> {
  const pocketBaseUrl = baseUrl(
    process.env.POCKETBASE_URL ?? 'http://127.0.0.1:8090',
    'POCKETBASE_URL',
  );
  const frontendUrl = baseUrl(process.env.APP_ORIGIN ?? 'http://localhost:3000', 'APP_ORIGIN');

  const backendHealth = pocketBaseHealthSchema.parse(
    await readJson(new URL(POCKETBASE_HEALTH_PATH, pocketBaseUrl), 'PocketBase'),
  );
  const frontendHealth = healthViewModelSchema.parse(
    await readJson(new URL('/api/health', frontendUrl), 'Next.js'),
  );

  if (
    backendHealth.apiVersion !== frontendHealth.apiVersion ||
    backendHealth.service !== frontendHealth.service
  ) {
    throw new Error('Next.js and PocketBase returned incompatible health contracts.');
  }

  console.log(
    `Integration healthy: Next.js -> ${frontendHealth.service} API v${frontendHealth.apiVersion}.`,
  );
}

try {
  await checkIntegration();
} catch (error) {
  console.error(
    'Integration check failed:',
    error instanceof Error ? error.message : 'Unknown error',
  );
  process.exitCode = 1;
}

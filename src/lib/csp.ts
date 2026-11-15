/**
 * Page Content-Security-Policy. Scripts require the per-request nonce (`strict-dynamic` lets Next's
 * own chunks load). Styles allow inline because React style attributes and Sonner/Base UI inject
 * runtime `<style>` elements; a style nonce would disable `'unsafe-inline'`.
 */
export function buildContentSecurityPolicy(options: {
  nonce: string;
  isDevelopment: boolean;
  upgradeInsecureRequests: boolean;
}): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${options.nonce}'`,
      "'strict-dynamic'",
      ...(options.isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'blob:', 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(options.isDevelopment ? ['ws:'] : [])],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  if (options.upgradeInsecureRequests) policy.push('upgrade-insecure-requests');
  return policy.join('; ');
}

export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

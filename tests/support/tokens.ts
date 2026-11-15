function base64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

/** Unsigned PocketBase-shaped token for tests (PocketBase, not the gateway, verifies signatures). */
export function fakeToken(options: { id?: string; expiresInSeconds: number }) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      id: options.id ?? 'user00000000001',
      type: 'auth',
      collectionId: '_pb_users_auth_',
      exp: Math.floor(Date.now() / 1000) + options.expiresInSeconds,
    }),
  );
  return `${header}.${payload}.signature`;
}

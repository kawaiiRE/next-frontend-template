/**
 * Writes a non-sensitive preference cookie from the browser (theme, sidebar, banners). Without
 * `maxAgeSeconds` it is a session cookie that the browser drops when the session ends.
 */
export function writePreferenceCookie(name: string, value: string, maxAgeSeconds?: number) {
  const maxAge = maxAgeSeconds === undefined ? '' : `; Max-Age=${maxAgeSeconds}`;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/${maxAge}; SameSite=Lax${secure}`;
}

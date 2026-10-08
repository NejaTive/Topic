/** Cookie с opaque session token. */
export const SESSION_COOKIE_NAME = 'topic_session';

/** Max-Age cookie и TTL сессии в БД (дефолт 30 дней). */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function sessionCookieSecure(): boolean {
  const base = process.env.PUBLIC_BASE_URL ?? '';
  return base.startsWith('https://');
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
    secure: sessionCookieSecure(),
  };
}

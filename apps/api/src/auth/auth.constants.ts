/** Cookie с opaque session token. */
export const SESSION_COOKIE_NAME = 'topic_session';

/** Max-Age cookie и TTL сессии в БД (дефолт 30 дней). */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS * 1000,
};

import { createHash, randomBytes } from 'node:crypto';

/** Opaque token для cookie + SHA-256 hash для БД. */
export function createSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

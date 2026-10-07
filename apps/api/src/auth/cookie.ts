import type { Request, Response } from 'express';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_SECONDS,
} from './auth.constants';

/** Парсинг Cookie header без cookie-parser. */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) {
    return undefined;
  }

  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) {
      continue;
    }
    const key = part.slice(0, idx).trim();
    if (key !== name) {
      continue;
    }
    return decodeURIComponent(part.slice(idx + 1).trim());
  }

  return undefined;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function sessionExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
}

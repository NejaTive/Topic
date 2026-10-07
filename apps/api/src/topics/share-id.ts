import { randomBytes } from 'node:crypto';

/** Opaque shareId для `/t/:shareId` (стабилен при смене privacy). */
export function createShareId(): string {
  return randomBytes(16).toString('base64url');
}

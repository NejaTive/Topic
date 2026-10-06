/**
 * previewCovers с BAC-10 — coverKey (или null). Публичный URL как на API:
 * `{S3_PUBLIC_URL}/{bucket}/{key}` (path-style MinIO).
 * Дефолты совпадают с apps/api/.env.example.
 */
const publicBase =
  (import.meta.env.VITE_S3_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://127.0.0.1:9000';

const bucket = (import.meta.env.VITE_S3_BUCKET as string | undefined) ?? 'topic-covers';

export function coverUrlFromKey(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  return `${publicBase}/${bucket}/${key}`;
}

export function previewCoverUrls(keys: Array<string | null> | undefined): string[] {
  if (!keys?.length) return [];
  return keys
    .map((key) => coverUrlFromKey(key))
    .filter((url): url is string => Boolean(url));
}

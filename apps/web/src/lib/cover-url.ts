/**
 * previewCovers — coverKey (или null) → URL для <img>.
 * Dev: MinIO на localhost. Prod (Caddy): same-origin `/{bucket}/{key}`.
 * VITE_S3_PUBLIC_URL — опциональный абсолютный origin (без trailing slash).
 */
const bucket = (import.meta.env.VITE_S3_BUCKET as string | undefined) ?? 'topic-covers';

function publicBase(): string {
  const fromEnv = (import.meta.env.VITE_S3_PUBLIC_URL as string | undefined)?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return 'http://127.0.0.1:9000';
  return '';
}

export function coverUrlFromKey(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
    return key;
  }
  const base = publicBase();
  const path = `/${bucket}/${key}`;
  return base ? `${base}${path}` : path;
}

/** До 3 URL/null в порядке rank — null = placeholder в TopicRow. */
export function previewCoverUrls(keys: Array<string | null> | undefined): Array<string | null> {
  if (!keys?.length) return [];
  return keys.slice(0, 3).map((key) => coverUrlFromKey(key));
}

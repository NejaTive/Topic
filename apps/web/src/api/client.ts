import createClient from 'openapi-fetch';
import type { paths } from './schema';

/** Typed OpenAPI client. Paths already include `/api` prefix (see BAC-2). */
export const apiClient = createClient<paths>({
  baseUrl: '',
  credentials: 'include',
});

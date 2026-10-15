import { apiClient } from './client';
import type { components } from './schema';

export type CatalogMovie = components['schemas']['CatalogMovieDto'];

export class CatalogApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'CatalogApiError';
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const message = (error as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const first = message.find((item): item is string => typeof item === 'string');
    if (first) return first;
  }
  return fallback;
}

export async function searchCatalogMovies(q = ''): Promise<CatalogMovie[]> {
  const { data, error, response } = await apiClient.GET('/api/catalog/movies/search', {
    params: { query: { q } },
  });
  if (response.status === 401) {
    throw new CatalogApiError('Требуется вход', 401);
  }
  if (error || !data) {
    throw new CatalogApiError(
      errorMessage(error, 'Не удалось выполнить поиск фильмов'),
      response.status,
    );
  }
  return data;
}

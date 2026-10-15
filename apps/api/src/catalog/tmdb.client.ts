import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_TIMEOUT_MS = 5_000;

type TmdbSearchMovie = {
  id: number;
  title?: string | null;
  original_title?: string | null;
  release_date?: string | null;
  poster_path?: string | null;
};

type TmdbSearchResponse = {
  results?: TmdbSearchMovie[];
};

export type TmdbMovieHit = {
  providerId: string;
  title: string;
  year?: number;
  imageUrl?: string | null;
};

@Injectable()
export class TmdbClient {
  private readonly logger = new Logger(TmdbClient.name);
  private readonly apiKey: string | undefined;
  private readonly accessToken: string | undefined;

  constructor(config: ConfigService) {
    this.apiKey = nonEmpty(config.get<string>('TMDB_API_KEY'));
    this.accessToken = nonEmpty(config.get<string>('TMDB_ACCESS_TOKEN'));
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey || this.accessToken);
  }

  async searchMovies(query: string): Promise<TmdbMovieHit[]> {
    const q = query.trim();
    if (!q || !this.isConfigured()) {
      return [];
    }

    const url = new URL(`${TMDB_API_BASE}/search/movie`);
    url.searchParams.set('query', q);
    url.searchParams.set('language', 'ru');
    url.searchParams.set('include_adult', 'false');

    try {
      const body = await this.tmdbGetJson<TmdbSearchResponse>(url);
      if (!body) {
        return [];
      }
      return (body.results ?? [])
        .map((item) => this.mapHit(item))
        .filter((hit): hit is TmdbMovieHit => hit !== null);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`TMDB search failed: ${reason}`);
      return [];
    }
  }

  async getMovie(providerId: string): Promise<TmdbMovieHit | null> {
    const id = providerId.trim();
    if (!id || !this.isConfigured()) {
      return null;
    }

    const url = new URL(`${TMDB_API_BASE}/movie/${encodeURIComponent(id)}`);
    url.searchParams.set('language', 'ru');

    try {
      const body = await this.tmdbGetJson<TmdbSearchMovie>(url);
      if (!body) {
        return null;
      }
      return this.mapHit(body);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`TMDB movie ${id} failed: ${reason}`);
      return null;
    }
  }

  private async tmdbGetJson<T>(url: URL): Promise<T | null> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    } else if (this.apiKey) {
      url.searchParams.set('api_key', this.apiKey);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        this.logger.warn(`TMDB HTTP ${res.status} ${url.pathname}`);
        return null;
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private mapHit(item: TmdbSearchMovie): TmdbMovieHit | null {
    if (typeof item.id !== 'number' || !Number.isFinite(item.id)) {
      return null;
    }

    const title = (item.title?.trim() || item.original_title?.trim()) ?? '';
    if (!title) {
      return null;
    }

    const year = parseYear(item.release_date);
    const imageUrl = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null;

    return {
      providerId: String(item.id),
      title,
      ...(year !== undefined ? { year } : {}),
      imageUrl,
    };
  }
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseYear(releaseDate: string | null | undefined): number | undefined {
  if (!releaseDate || releaseDate.length < 4) {
    return undefined;
  }
  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : undefined;
}

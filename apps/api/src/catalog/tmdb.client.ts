import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_TIMEOUT_MS = 5_000;
const META_FIELD_MAX = 100;
const META_DESCRIPTION_MAX = 2000;

type TmdbSearchMovie = {
  id: number;
  title?: string | null;
  original_title?: string | null;
  release_date?: string | null;
  poster_path?: string | null;
};

type TmdbSearchTv = {
  id: number;
  name?: string | null;
  original_name?: string | null;
  first_air_date?: string | null;
  poster_path?: string | null;
};

type TmdbSearchResponse<T> = {
  results?: T[];
};

type TmdbGenre = { name?: string | null };
type TmdbCountry = { name?: string | null };
type TmdbCrew = { job?: string | null; name?: string | null };
type TmdbCreatedBy = { name?: string | null };

type TmdbMovieDetails = TmdbSearchMovie & {
  overview?: string | null;
  genres?: TmdbGenre[];
  production_countries?: TmdbCountry[];
  credits?: { crew?: TmdbCrew[] };
};

type TmdbTvDetails = TmdbSearchTv & {
  overview?: string | null;
  genres?: TmdbGenre[];
  production_countries?: TmdbCountry[];
  created_by?: TmdbCreatedBy[];
  credits?: { crew?: TmdbCrew[] };
};

export type TmdbMovieHit = {
  providerId: string;
  title: string;
  year?: number;
  imageUrl?: string | null;
  description?: string;
  director?: string;
  genre?: string;
  country?: string;
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
      const body = await this.tmdbGetJson<TmdbSearchResponse<TmdbSearchMovie>>(url);
      if (!body) {
        return [];
      }
      return (body.results ?? [])
        .map((item) => this.mapMovieHit(item))
        .filter((hit): hit is TmdbMovieHit => hit !== null);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`TMDB movie search failed: ${reason}`);
      return [];
    }
  }

  async searchTv(query: string): Promise<TmdbMovieHit[]> {
    const q = query.trim();
    if (!q || !this.isConfigured()) {
      return [];
    }

    const url = new URL(`${TMDB_API_BASE}/search/tv`);
    url.searchParams.set('query', q);
    url.searchParams.set('language', 'ru');
    url.searchParams.set('include_adult', 'false');

    try {
      const body = await this.tmdbGetJson<TmdbSearchResponse<TmdbSearchTv>>(url);
      if (!body) {
        return [];
      }
      return (body.results ?? [])
        .map((item) => this.mapTvHit(item))
        .filter((hit): hit is TmdbMovieHit => hit !== null);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`TMDB tv search failed: ${reason}`);
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
    url.searchParams.set('append_to_response', 'credits');

    try {
      const body = await this.tmdbGetJson<TmdbMovieDetails>(url);
      if (!body) {
        return null;
      }
      return this.mapMovieDetails(body);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`TMDB movie ${id} failed: ${reason}`);
      return null;
    }
  }

  async getTv(providerId: string): Promise<TmdbMovieHit | null> {
    const id = providerId.trim();
    if (!id || !this.isConfigured()) {
      return null;
    }

    const url = new URL(`${TMDB_API_BASE}/tv/${encodeURIComponent(id)}`);
    url.searchParams.set('language', 'ru');
    url.searchParams.set('append_to_response', 'credits');

    try {
      const body = await this.tmdbGetJson<TmdbTvDetails>(url);
      if (!body) {
        return null;
      }
      return this.mapTvDetails(body);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`TMDB tv ${id} failed: ${reason}`);
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

  private mapMovieHit(item: TmdbSearchMovie): TmdbMovieHit | null {
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

  private mapTvHit(item: TmdbSearchTv): TmdbMovieHit | null {
    if (typeof item.id !== 'number' || !Number.isFinite(item.id)) {
      return null;
    }

    const title = (item.name?.trim() || item.original_name?.trim()) ?? '';
    if (!title) {
      return null;
    }

    const year = parseYear(item.first_air_date);
    const imageUrl = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null;

    return {
      providerId: String(item.id),
      title,
      ...(year !== undefined ? { year } : {}),
      imageUrl,
    };
  }

  private mapMovieDetails(item: TmdbMovieDetails): TmdbMovieHit | null {
    const base = this.mapMovieHit(item);
    if (!base) {
      return null;
    }

    const description = firstMetaString(item.overview, META_DESCRIPTION_MAX);
    const director = firstMetaString(
      item.credits?.crew?.find((member) => member.job === 'Director')?.name,
    );
    const genre = firstMetaString(item.genres?.[0]?.name);
    const country = firstMetaString(item.production_countries?.[0]?.name);

    return {
      ...base,
      ...(description ? { description } : {}),
      ...(director ? { director } : {}),
      ...(genre ? { genre } : {}),
      ...(country ? { country } : {}),
    };
  }

  private mapTvDetails(item: TmdbTvDetails): TmdbMovieHit | null {
    const base = this.mapTvHit(item);
    if (!base) {
      return null;
    }

    const description = firstMetaString(item.overview, META_DESCRIPTION_MAX);
    const director = firstMetaString(item.created_by?.[0]?.name);
    const genre = firstMetaString(item.genres?.[0]?.name);
    const country = firstMetaString(item.production_countries?.[0]?.name);

    return {
      ...base,
      ...(description ? { description } : {}),
      ...(director ? { director } : {}),
      ...(genre ? { genre } : {}),
      ...(country ? { country } : {}),
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

function firstMetaString(
  value: string | null | undefined,
  maxLength = META_FIELD_MAX,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, maxLength);
}

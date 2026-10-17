import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const RAWG_API_BASE = 'https://api.rawg.io/api';
const RAWG_TIMEOUT_MS = 5_000;
const META_FIELD_MAX = 100;
const META_DESCRIPTION_MAX = 2000;

type RawgNamed = { name?: string | null };
type RawgPlatformWrap = { platform?: RawgNamed | null };

type RawgSearchGame = {
  id: number;
  name?: string | null;
  slug?: string | null;
  released?: string | null;
  background_image?: string | null;
};

type RawgSearchResponse = {
  results?: RawgSearchGame[];
};

type RawgGameDetails = RawgSearchGame & {
  description_raw?: string | null;
  description?: string | null;
  developers?: RawgNamed[];
  genres?: RawgNamed[];
  platforms?: RawgPlatformWrap[];
};

export type RawgGameHit = {
  providerId: string;
  title: string;
  year?: number;
  imageUrl?: string | null;
  slug?: string;
  description?: string;
  director?: string;
  genre?: string;
  country?: string;
};

@Injectable()
export class RawgClient {
  private readonly logger = new Logger(RawgClient.name);
  private readonly apiKey: string | undefined;

  constructor(config: ConfigService) {
    this.apiKey = nonEmpty(config.get<string>('RAWG_API_KEY'));
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async searchGames(query: string): Promise<RawgGameHit[]> {
    const q = query.trim();
    if (!q || !this.isConfigured()) {
      return [];
    }

    const url = new URL(`${RAWG_API_BASE}/games`);
    url.searchParams.set('search', q);
    url.searchParams.set('page_size', '20');
    url.searchParams.set('lang', 'ru');

    try {
      const body = await this.rawgGetJson<RawgSearchResponse>(url);
      if (!body) {
        return [];
      }
      return (body.results ?? [])
        .map((item) => this.mapSearchHit(item))
        .filter((hit): hit is RawgGameHit => hit !== null);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`RAWG game search failed: ${reason}`);
      return [];
    }
  }

  async getGame(providerId: string): Promise<RawgGameHit | null> {
    const id = providerId.trim();
    if (!id || !this.isConfigured()) {
      return null;
    }

    const url = new URL(`${RAWG_API_BASE}/games/${encodeURIComponent(id)}`);
    url.searchParams.set('lang', 'ru');

    try {
      const body = await this.rawgGetJson<RawgGameDetails>(url);
      if (!body) {
        return null;
      }
      return this.mapDetails(body);
    } catch (err) {
      const reason = err instanceof Error ? err.name : 'unknown';
      this.logger.warn(`RAWG game ${id} failed: ${reason}`);
      return null;
    }
  }

  private async rawgGetJson<T>(url: URL): Promise<T | null> {
    if (this.apiKey) {
      url.searchParams.set('key', this.apiKey);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RAWG_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        this.logger.warn(`RAWG HTTP ${res.status} ${url.pathname}`);
        return null;
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private mapSearchHit(item: RawgSearchGame): RawgGameHit | null {
    if (typeof item.id !== 'number' || !Number.isFinite(item.id)) {
      return null;
    }

    const title = item.name?.trim() ?? '';
    if (!title) {
      return null;
    }

    const year = parseYear(item.released);
    const imageUrl = item.background_image?.trim() || null;
    const slug = item.slug?.trim() || undefined;

    return {
      providerId: String(item.id),
      title,
      ...(year !== undefined ? { year } : {}),
      imageUrl,
      ...(slug ? { slug } : {}),
    };
  }

  private mapDetails(item: RawgGameDetails): RawgGameHit | null {
    const base = this.mapSearchHit(item);
    if (!base) {
      return null;
    }

    const description = firstMetaString(
      item.description_raw || stripHtml(item.description),
      META_DESCRIPTION_MAX,
    );
    const director = firstMetaString(item.developers?.[0]?.name);
    const genre = firstMetaString(item.genres?.[0]?.name);
    const country = firstMetaString(item.platforms?.[0]?.platform?.name);

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

function stripHtml(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

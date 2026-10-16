import { Prisma } from '../generated/prisma/client';
import type { ItemMetaDto } from './dto/item-meta.dto';

const META_FIELD_MAX = 100;
const META_DESCRIPTION_MAX = 2000;
const META_SOURCE_URL_MAX = 500;

export type MoviesMeta = {
  description?: string;
  director?: string;
  genre?: string;
  country?: string;
  sourceUrl?: string;
};

export function metaToDto(value: Prisma.JsonValue | null | undefined): ItemMetaDto | null {
  const parsed = parseMoviesMeta(value);
  if (
    !parsed.description &&
    !parsed.director &&
    !parsed.genre &&
    !parsed.country &&
    !parsed.sourceUrl
  ) {
    return null;
  }
  return {
    description: parsed.description ?? null,
    director: parsed.director ?? null,
    genre: parsed.genre ?? null,
    country: parsed.country ?? null,
    sourceUrl: parsed.sourceUrl ?? null,
  };
}

export function parseMoviesMeta(value: Prisma.JsonValue | null | undefined): MoviesMeta {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    ...(typeof record.description === 'string' && record.description.trim()
      ? { description: record.description.trim().slice(0, META_DESCRIPTION_MAX) }
      : {}),
    ...(typeof record.director === 'string' && record.director.trim()
      ? { director: record.director.trim().slice(0, META_FIELD_MAX) }
      : {}),
    ...(typeof record.genre === 'string' && record.genre.trim()
      ? { genre: record.genre.trim().slice(0, META_FIELD_MAX) }
      : {}),
    ...(typeof record.country === 'string' && record.country.trim()
      ? { country: record.country.trim().slice(0, META_FIELD_MAX) }
      : {}),
    ...(typeof record.sourceUrl === 'string' && record.sourceUrl.trim()
      ? { sourceUrl: record.sourceUrl.trim().slice(0, META_SOURCE_URL_MAX) }
      : {}),
  };
}

/** Патч с клиента: sourceUrl не принимаем — только server-set. */
export function normalizeMoviesMetaPatch(patch: ItemMetaDto): MoviesMeta {
  const next: MoviesMeta = {};
  if (patch.description !== undefined) {
    const trimmed = patch.description?.trim() ?? '';
    if (trimmed) next.description = trimmed.slice(0, META_DESCRIPTION_MAX);
  }
  if (patch.director !== undefined) {
    const trimmed = patch.director?.trim() ?? '';
    if (trimmed) next.director = trimmed.slice(0, META_FIELD_MAX);
  }
  if (patch.genre !== undefined) {
    const trimmed = patch.genre?.trim() ?? '';
    if (trimmed) next.genre = trimmed.slice(0, META_FIELD_MAX);
  }
  if (patch.country !== undefined) {
    const trimmed = patch.country?.trim() ?? '';
    if (trimmed) next.country = trimmed.slice(0, META_FIELD_MAX);
  }
  return next;
}

/** Патч с клиента: sourceUrl не меняем (сохраняем текущий). */
export function applyMoviesMetaPatch(current: MoviesMeta, patch: ItemMetaDto): MoviesMeta {
  const next: MoviesMeta = { ...current };
  if (patch.description !== undefined) {
    const trimmed = patch.description?.trim() ?? '';
    if (trimmed) next.description = trimmed.slice(0, META_DESCRIPTION_MAX);
    else delete next.description;
  }
  if (patch.director !== undefined) {
    const trimmed = patch.director?.trim() ?? '';
    if (trimmed) next.director = trimmed.slice(0, META_FIELD_MAX);
    else delete next.director;
  }
  if (patch.genre !== undefined) {
    const trimmed = patch.genre?.trim() ?? '';
    if (trimmed) next.genre = trimmed.slice(0, META_FIELD_MAX);
    else delete next.genre;
  }
  if (patch.country !== undefined) {
    const trimmed = patch.country?.trim() ?? '';
    if (trimmed) next.country = trimmed.slice(0, META_FIELD_MAX);
    else delete next.country;
  }
  return next;
}

export function moviesMetaToJson(meta: MoviesMeta): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const out: Record<string, string> = {};
  if (meta.description) out.description = meta.description;
  if (meta.director) out.director = meta.director;
  if (meta.genre) out.genre = meta.genre;
  if (meta.country) out.country = meta.country;
  if (meta.sourceUrl) out.sourceUrl = meta.sourceUrl;
  if (Object.keys(out).length === 0) {
    return Prisma.DbNull;
  }
  return out;
}

export function tmdbMovieSourceUrl(providerId: string): string {
  return `https://www.themoviedb.org/movie/${providerId.trim()}`.slice(0, META_SOURCE_URL_MAX);
}

export function tmdbTvSourceUrl(providerId: string): string {
  return `https://www.themoviedb.org/tv/${providerId.trim()}`.slice(0, META_SOURCE_URL_MAX);
}

export function rawgGameSourceUrl(slugOrId: string): string {
  return `https://rawg.io/games/${slugOrId.trim()}`.slice(0, META_SOURCE_URL_MAX);
}

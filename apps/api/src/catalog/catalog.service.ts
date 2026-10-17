import { Injectable } from '@nestjs/common';
import type { CatalogMovieDto } from './dto/catalog-movie.dto';
import { RawgClient } from './rawg.client';
import { TmdbClient } from './tmdb.client';

@Injectable()
export class CatalogService {
  constructor(
    private readonly tmdb: TmdbClient,
    private readonly rawg: RawgClient,
  ) {}

  searchMovies(q: string | undefined): Promise<CatalogMovieDto[]> {
    return this.tmdb.searchMovies(q ?? '');
  }

  searchSeries(q: string | undefined): Promise<CatalogMovieDto[]> {
    return this.tmdb.searchTv(q ?? '');
  }

  searchGames(q: string | undefined): Promise<CatalogMovieDto[]> {
    return this.rawg.searchGames(q ?? '');
  }
}

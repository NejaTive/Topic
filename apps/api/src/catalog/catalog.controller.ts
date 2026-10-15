import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CatalogService } from './catalog.service';
import { CatalogMovieDto } from './dto/catalog-movie.dto';

@ApiTags('catalog')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('movies/search')
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Строка поиска; пустая / без ключа TMDB → []',
  })
  @ApiOkResponse({ type: CatalogMovieDto, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  searchMovies(@Query('q') q?: string): Promise<CatalogMovieDto[]> {
    return this.catalog.searchMovies(q);
  }
}

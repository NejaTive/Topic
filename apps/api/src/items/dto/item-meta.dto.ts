import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

/** Category-specific поля элемента. Для movies: description / director / genre / country / sourceUrl. */
export class ItemMetaDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Команда исследователей путешествует через червоточину…',
    maxLength: 2000,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Кристофер Нолан',
    maxLength: 100,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  director?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Фантастика',
    maxLength: 100,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  genre?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'США',
    maxLength: 100,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  country?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'Публичная ссылка на источник (TMDB); только server-set в from-catalog, в create/update с клиента игнорируется',
    example: 'https://www.themoviedb.org/movie/157336',
    maxLength: 500,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  sourceUrl?: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class FromCatalogItemDto {
  @ApiProperty({
    enum: ['tmdb', 'rawg'],
    example: 'tmdb',
    description: 'Провайдер каталога: tmdb (movies/series) или rawg (games)',
  })
  @IsIn(['tmdb', 'rawg'])
  provider!: 'tmdb' | 'rawg';

  @ApiProperty({
    example: '157336',
    description: 'Id у провайдера; в Item не сохраняется',
    minLength: 1,
    maxLength: 32,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  providerId!: string;
}

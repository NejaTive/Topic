import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class FromCatalogItemDto {
  @ApiProperty({
    enum: ['tmdb'],
    example: 'tmdb',
    description: 'Провайдер каталога (v1 — только TMDB)',
  })
  @IsIn(['tmdb'])
  provider!: 'tmdb';

  @ApiProperty({
    example: '157336',
    description: 'Id фильма у провайдера; в Item не сохраняется',
    minLength: 1,
    maxLength: 32,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  providerId!: string;
}

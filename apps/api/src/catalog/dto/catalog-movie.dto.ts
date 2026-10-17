import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogMovieDto {
  @ApiProperty({
    example: '157336',
    description: 'Id у провайдера (TMDB movie/tv); в Item v1 не сохраняется',
  })
  providerId!: string;

  @ApiProperty({ example: 'Интерстеллар' })
  title!: string;

  @ApiPropertyOptional({
    example: 2014,
    description: 'Год из release_date / first_air_date; отсутствует, если даты нет',
  })
  year?: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    description: 'Полный URL обложки провайдера; null/omit если нет',
  })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'cyberpunk-2077',
    description: 'Slug у RAWG (games); для дедупа sourceUrl; у TMDB отсутствует',
  })
  slug?: string;
}

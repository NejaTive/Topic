import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicCategory } from '../../generated/prisma/enums';
import { ItemMetaDto } from './item-meta.dto';

export class RecommendationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Dune 2' })
  title!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Публичный URL обложки снимка или null',
    example: 'http://127.0.0.1:9000/topic-covers/covers/abc.webp',
  })
  coverUrl!: string | null;

  @ApiProperty({ enum: TopicCategory })
  category!: TopicCategory;

  @ApiPropertyOptional({
    type: ItemMetaDto,
    nullable: true,
    description: 'Снимок meta; null если пусто',
  })
  meta!: ItemMetaDto | null;

  @ApiProperty({ example: 'alice' })
  fromNick!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class RecommendationListDto {
  @ApiProperty({ type: RecommendationDto, isArray: true })
  items!: RecommendationDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicCategory, TopicPrivacy } from '../../generated/prisma/enums';
import { ItemMetaDto } from '../../items/dto/item-meta.dto';

/** Ranked-элемент в публичном Share-ответе (без inbox / placement). */
export class ShareItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Dune 2' })
  title!: string;

  @ApiProperty({
    description: 'Плотный 1…N по rankPosition',
    example: 1,
  })
  rankPosition!: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Публичный URL обложки или null',
    example: 'http://127.0.0.1:9000/topic-covers/covers/abc.webp',
  })
  coverUrl!: string | null;

  @ApiPropertyOptional({
    type: ItemMetaDto,
    nullable: true,
    description: 'Category-specific поля; null если пусто',
  })
  meta!: ItemMetaDto | null;
}

/** Публичный read-only топик по shareId (S09). */
export class ShareTopicDto {
  @ApiProperty({ example: 'Фильмы 2026' })
  title!: string;

  @ApiProperty({ enum: TopicCategory })
  category!: TopicCategory;

  @ApiProperty({
    enum: TopicPrivacy,
    description: 'unlisted | public (private → 403, в тело не попадает)',
  })
  privacy!: TopicPrivacy;

  @ApiProperty({ example: 'alice' })
  ownerNick!: string;

  @ApiProperty({
    type: ShareItemDto,
    isArray: true,
    description: 'Только placement=ranked, порядок по rankPosition; inbox отсутствует',
  })
  items!: ShareItemDto[];
}

export class ForbiddenShareResponseDto {
  @ApiProperty({ example: 'Топик недоступен' })
  message!: string;

  @ApiProperty({ example: 403 })
  statusCode!: number;
}

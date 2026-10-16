import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemPlacement } from '../../generated/prisma/enums';
import { ItemMetaDto } from './item-meta.dto';

export class ItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  topicId!: string;

  @ApiProperty({ example: 'Dune 2' })
  title!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Публичный URL обложки (прямой MinIO path-style) или null',
    example: 'http://127.0.0.1:9000/topic-covers/covers/abc.webp',
  })
  coverUrl!: string | null;

  @ApiPropertyOptional({
    type: ItemMetaDto,
    nullable: true,
    description: 'Category-specific поля; null для custom / пустого meta',
  })
  meta!: ItemMetaDto | null;

  @ApiProperty({ enum: ItemPlacement })
  placement!: ItemPlacement;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Плотный 1…N только для ranked; иначе null',
  })
  rankPosition!: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

/** Список элементов топика: inbox (unranked) + ranked. */
export class ItemListDto {
  @ApiProperty({ type: ItemDto, isArray: true })
  inbox!: ItemDto[];

  @ApiProperty({ type: ItemDto, isArray: true })
  ranked!: ItemDto[];
}

export class ItemNotFoundResponseDto {
  @ApiProperty({ example: 'Элемент не найден' })
  message!: string;

  @ApiProperty({ example: 404 })
  statusCode!: number;
}

export class ItemBadRequestResponseDto {
  @ApiProperty({
    example: 'Импорт из каталога доступен только для топиков категории «Фильмы»',
  })
  message!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;
}

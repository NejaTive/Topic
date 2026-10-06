import { ApiProperty } from '@nestjs/swagger';
import { TopicPrivacy } from '../../generated/prisma/enums';

/** Элемент списка топиков владельца. */
export class TopicListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Фильмы 2026' })
  title!: string;

  @ApiProperty({ enum: TopicPrivacy })
  privacy!: TopicPrivacy;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', nullable: true },
    description:
      'coverKey топ-3 ranked по rankPosition (или пустой массив). Элемент null — ranked без обложки.',
    example: ['covers/abc.webp', null],
  })
  previewCovers!: Array<string | null>;
}

export class TopicDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    example: 'xY7k_mPq2RnVw8sZ',
    description: 'Opaque shareId; не меняется при PATCH privacy',
  })
  shareId!: string;

  @ApiProperty({ example: 'Фильмы 2026' })
  title!: string;

  @ApiProperty({ enum: TopicPrivacy })
  privacy!: TopicPrivacy;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: 'Топик не найден' })
  message!: string;

  @ApiProperty({ example: 404 })
  statusCode!: number;
}

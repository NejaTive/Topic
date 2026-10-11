import { ApiProperty } from '@nestjs/swagger';

export class FeedItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    example: 'xY7k_mPq2RnVw8sZ',
    description: 'Opaque shareId; клик → /t/:shareId',
  })
  shareId!: string;

  @ApiProperty({ example: 'Фильмы 2026' })
  title!: string;

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

  @ApiProperty({ example: 'topic_fan', description: 'nick владельца топика' })
  ownerNick!: string;
}

export class FeedDto {
  @ApiProperty({
    example: 3,
    description: 'Число подписок текущего пользователя (empty vs empty·subscribed)',
  })
  followingCount!: number;

  @ApiProperty({ type: FeedItemDto, isArray: true })
  items!: FeedItemDto[];
}

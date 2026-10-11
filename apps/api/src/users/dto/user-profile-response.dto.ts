import { ApiProperty } from '@nestjs/swagger';

export class ProfileTopicDto {
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
}

export class UserProfileDto {
  @ApiProperty({ example: 'topic_fan' })
  nick!: string;

  @ApiProperty({ example: 12 })
  followersCount!: number;

  @ApiProperty({ example: 5 })
  followingCount!: number;

  @ApiProperty({ example: 3, description: 'Число public-топиков владельца' })
  topicsCount!: number;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Сессия есть и me.id === владелец профиля',
  })
  isSelf!: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    nullable: true,
    description: 'null без сессии; иначе подписан ли me на владельца',
  })
  isFollowing!: boolean | null;

  @ApiProperty({ type: ProfileTopicDto, isArray: true })
  topics!: ProfileTopicDto[];
}

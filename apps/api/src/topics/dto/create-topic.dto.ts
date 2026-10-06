import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TopicPrivacy } from '../../generated/prisma/enums';

export class CreateTopicDto {
  @ApiProperty({ example: 'Фильмы 2026', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    enum: TopicPrivacy,
    default: TopicPrivacy.unlisted,
    description: 'По умолчанию unlisted',
  })
  @IsOptional()
  @IsEnum(TopicPrivacy)
  privacy?: TopicPrivacy;
}

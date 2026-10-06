import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TopicPrivacy } from '../../generated/prisma/enums';

export class UpdateTopicDto {
  @ApiPropertyOptional({ example: 'Фильмы 2026', minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ enum: TopicPrivacy })
  @IsOptional()
  @IsEnum(TopicPrivacy)
  privacy?: TopicPrivacy;
}

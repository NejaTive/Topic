import { ApiProperty } from '@nestjs/swagger';

export class MutualFollowItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'topic_fan' })
  nick!: string;
}

export class MutualFollowsDto {
  @ApiProperty({ type: MutualFollowItemDto, isArray: true })
  items!: MutualFollowItemDto[];
}

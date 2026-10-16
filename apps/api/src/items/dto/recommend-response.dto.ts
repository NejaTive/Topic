import { ApiProperty } from '@nestjs/swagger';

export class RecommendCreatedDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description: 'ID созданных Recommendation (pending)',
  })
  ids!: string[];
}

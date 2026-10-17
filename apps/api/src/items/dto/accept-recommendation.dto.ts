import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AcceptRecommendationDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Свой топик той же category, куда копировать в inbox',
  })
  @IsUUID()
  topicId!: string;
}

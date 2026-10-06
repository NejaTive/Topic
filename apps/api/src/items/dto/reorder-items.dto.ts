import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReorderItemsDto {
  @ApiProperty({
    type: String,
    isArray: true,
    format: 'uuid',
    description:
      'Полная перестановка id всех ranked-элементов топика (новый порядок = rankPosition 1…N). Inbox не участвует.',
    example: [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  orderedItemIds!: string[];
}

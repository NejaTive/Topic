import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, Equals, IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class RecommendItemDto {
  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'ID получателей (каждый — взаимная подписка)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  recipientIds?: string[];

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Всем взаимным подпискам',
  })
  @IsOptional()
  @IsBoolean()
  @Equals(true)
  all?: boolean;
}

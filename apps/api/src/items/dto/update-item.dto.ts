import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { ItemMetaDto } from './item-meta.dto';

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'Dune 2', minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    type: ItemMetaDto,
    description: 'Частичный merge; только для category=movies|series|games; иначе 400',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ItemMetaDto)
  meta?: ItemMetaDto;
}

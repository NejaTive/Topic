import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { ItemMetaDto } from './item-meta.dto';

export class CreateItemDto {
  @ApiProperty({ example: 'Dune 2', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    type: ItemMetaDto,
    description: 'Только для топиков category=movies|series|games; иначе 400',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ItemMetaDto)
  meta?: ItemMetaDto;
}

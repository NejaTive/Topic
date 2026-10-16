import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

/** Category-specific поля элемента. Для movies: description / director / genre / country. */
export class ItemMetaDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Команда исследователей путешествует через червоточину…',
    maxLength: 2000,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Кристофер Нолан',
    maxLength: 100,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  director?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Фантастика',
    maxLength: 100,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  genre?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'США',
    maxLength: 100,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(100)
  country?: string | null;
}

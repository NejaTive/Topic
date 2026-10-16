import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CopyFromShareDto {
  @ApiProperty({
    example: 'ILcBO4JTj9X9n53F-rgizA',
    description: 'Opaque shareId исходного топика',
    minLength: 1,
    maxLength: 64,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  shareId!: string;

  @ApiProperty({ format: 'uuid', description: 'Id элемента в исходном топике' })
  @IsUUID()
  itemId!: string;
}

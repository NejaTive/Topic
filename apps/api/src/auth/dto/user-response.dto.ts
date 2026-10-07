import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'topic_fan' })
  nick!: string;
}

export class ConflictResponseDto {
  @ApiProperty({ example: 'email занят' })
  message!: string;

  @ApiProperty({ enum: ['email', 'nick'], example: 'email' })
  field!: 'email' | 'nick';
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 'Неверный email или пароль' })
  message!: string;

  @ApiProperty({ example: 401 })
  statusCode!: number;
}

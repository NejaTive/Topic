import { ApiProperty } from '@nestjs/swagger';

export class UserNotFoundResponseDto {
  @ApiProperty({ example: 'Пользователь не найден' })
  message!: string;

  @ApiProperty({ example: 404 })
  statusCode!: number;
}

export class FollowBadRequestResponseDto {
  @ApiProperty({ example: 'Нельзя подписаться на себя' })
  message!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;
}

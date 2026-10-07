import { ApiProperty } from '@nestjs/swagger';

export class HealthOkResponseDto {
  @ApiProperty({ example: 'ok', description: 'Итоговый статус сервиса' })
  status!: string;

  @ApiProperty({ example: 'up', description: 'Доступность БД' })
  db!: string;
}

export class HealthErrorResponseDto {
  @ApiProperty({ example: 'error', description: 'Итоговый статус сервиса' })
  status!: string;

  @ApiProperty({ example: 'down', description: 'Доступность БД' })
  db!: string;
}

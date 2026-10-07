import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Укажите корректный email' })
  email!: string;

  @ApiProperty({ example: 'password1', minLength: 8 })
  @IsString({ message: 'Укажите пароль' })
  @MinLength(8, { message: 'Пароль должен быть не короче 8 символов' })
  password!: string;
}

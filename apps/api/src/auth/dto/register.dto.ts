import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Укажите корректный email' })
  email!: string;

  @ApiProperty({ example: 'password1', minLength: 8 })
  @IsString({ message: 'Укажите пароль' })
  @MinLength(8, { message: 'Пароль должен быть не короче 8 символов' })
  password!: string;

  @ApiProperty({
    example: 'topic_fan',
    description: 'Латиница, цифры, _; длина 3–30; сохраняется в lowercase',
    minLength: 3,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9_]{3,30}$',
  })
  @IsString({ message: 'Укажите ник' })
  @MinLength(3, { message: 'Ник должен быть не короче 3 символов' })
  @MaxLength(30, { message: 'Ник должен быть не длиннее 30 символов' })
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, {
    message: 'В нике допустимы только a-z, 0-9 и _; длина 3–30',
  })
  nick!: string;
}

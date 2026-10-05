import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password1', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'topic_fan',
    description: 'Латиница, цифры, _; длина 3–30; сохраняется в lowercase',
    minLength: 3,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9_]{3,30}$',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, {
    message: 'nick: только a-z, 0-9, _; длина 3–30',
  })
  nick!: string;
}

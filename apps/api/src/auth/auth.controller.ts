import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SESSION_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';
import { clearSessionCookie, readCookie, setSessionCookie } from './cookie';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ConflictResponseDto,
  UnauthorizedResponseDto,
  UserResponseDto,
} from './dto/user-response.dto';
import { AuthGuard } from './guards/auth.guard';
import type { AuthUser } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ type: ConflictResponseDto })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const { user, token } = await this.auth.register(dto);
    setSessionCookie(res, token);
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const { user, token } = await this.auth.login(dto);
    setSessionCookie(res, token);
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } },
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const token = readCookie(req, SESSION_COOKIE_NAME);
    await this.auth.logout(token);
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth(SESSION_COOKIE_NAME)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  me(@CurrentUser() user: AuthUser): UserResponseDto {
    return user;
  }
}

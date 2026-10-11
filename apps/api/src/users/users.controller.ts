import { Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  FollowBadRequestResponseDto,
  UserNotFoundResponseDto,
} from './dto/user-error-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post(':nick/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiBadRequestResponse({ type: FollowBadRequestResponseDto })
  @ApiNotFoundResponse({ type: UserNotFoundResponseDto })
  async follow(@CurrentUser() user: AuthUser, @Param('nick') nick: string): Promise<void> {
    await this.users.follow(user.id, nick);
  }

  @Delete(':nick/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: UserNotFoundResponseDto })
  async unfollow(@CurrentUser() user: AuthUser, @Param('nick') nick: string): Promise<void> {
    await this.users.unfollow(user.id, nick);
  }
}

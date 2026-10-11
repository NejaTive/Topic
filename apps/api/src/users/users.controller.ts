import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalCurrentUser } from '../auth/decorators/optional-current-user.decorator';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import {
  FollowBadRequestResponseDto,
  UserNotFoundResponseDto,
} from './dto/user-error-response.dto';
import { UserProfileDto } from './dto/user-profile-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':nick')
  @UseGuards(OptionalAuthGuard)
  @ApiCookieAuth(SESSION_COOKIE_NAME)
  @ApiOkResponse({ type: UserProfileDto })
  @ApiNotFoundResponse({ type: UserNotFoundResponseDto })
  getProfile(
    @Param('nick') nick: string,
    @OptionalCurrentUser() viewer: AuthUser | undefined,
  ): Promise<UserProfileDto> {
    return this.users.getProfile(nick, viewer?.id);
  }

  @Post(':nick/follow')
  @UseGuards(AuthGuard)
  @ApiCookieAuth(SESSION_COOKIE_NAME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiBadRequestResponse({ type: FollowBadRequestResponseDto })
  @ApiNotFoundResponse({ type: UserNotFoundResponseDto })
  async follow(@CurrentUser() user: AuthUser, @Param('nick') nick: string): Promise<void> {
    await this.users.follow(user.id, nick);
  }

  @Delete(':nick/follow')
  @UseGuards(AuthGuard)
  @ApiCookieAuth(SESSION_COOKIE_NAME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: UserNotFoundResponseDto })
  async unfollow(@CurrentUser() user: AuthUser, @Param('nick') nick: string): Promise<void> {
    await this.users.unfollow(user.id, nick);
  }
}

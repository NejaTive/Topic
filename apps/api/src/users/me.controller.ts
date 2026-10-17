import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MutualFollowsDto } from './dto/mutual-follows-response.dto';
import { UsersService } from './users.service';

@ApiTags('me')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly users: UsersService) {}

  @Get('mutual-follows')
  @ApiOkResponse({ type: MutualFollowsDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getMutualFollows(@CurrentUser() user: AuthUser): Promise<MutualFollowsDto> {
    return this.users.getMutualFollows(user.id);
  }
}

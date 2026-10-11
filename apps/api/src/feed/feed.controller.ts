import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FeedDto } from './dto/feed-response.dto';
import { FeedService } from './feed.service';

@ApiTags('feed')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  @ApiOkResponse({ type: FeedDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getFeed(@CurrentUser() user: AuthUser): Promise<FeedDto> {
    return this.feed.getFeed(user.id);
  }
}

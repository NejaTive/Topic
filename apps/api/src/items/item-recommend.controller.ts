import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
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
  ItemBadRequestResponseDto,
  ItemConflictResponseDto,
  ItemNotFoundResponseDto,
} from './dto/item-response.dto';
import { RecommendItemDto } from './dto/recommend-item.dto';
import { RecommendCreatedDto } from './dto/recommend-response.dto';
import { ItemsService } from './items.service';

@ApiTags('items')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('items')
export class ItemRecommendController {
  constructor(private readonly items: ItemsService) {}

  @Post(':itemId/recommend')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: RecommendCreatedDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiBadRequestResponse({ type: ItemBadRequestResponseDto })
  @ApiConflictResponse({
    description: 'Уже есть pending-рекомендация этой пары (from, to, sourceItemId)',
    type: ItemConflictResponseDto,
  })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  recommend(
    @CurrentUser() user: AuthUser,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: RecommendItemDto,
  ): Promise<RecommendCreatedDto> {
    return this.items.recommendOwned(user.id, itemId, dto);
  }
}

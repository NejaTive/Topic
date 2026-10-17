import {
  Body,
  Controller,
  Get,
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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AcceptRecommendationDto } from './dto/accept-recommendation.dto';
import {
  ItemBadRequestResponseDto,
  ItemConflictResponseDto,
  ItemDto,
  ItemNotFoundResponseDto,
} from './dto/item-response.dto';
import { RecommendationListDto } from './dto/recommendation-response.dto';
import { ItemsService } from './items.service';

@ApiTags('recommendations')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @ApiOkResponse({ type: RecommendationListDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  listPending(@CurrentUser() user: AuthUser): Promise<RecommendationListDto> {
    return this.items.listPendingRecommendations(user.id);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiBadRequestResponse({ type: ItemBadRequestResponseDto })
  @ApiConflictResponse({
    description: 'Элемент с тем же sourceUrl уже есть в целевом топике',
    type: ItemConflictResponseDto,
  })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  accept(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptRecommendationDto,
  ): Promise<ItemDto> {
    return this.items.acceptRecommendation(user.id, id, dto.topicId);
  }

  @Post(':id/dismiss')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  dismiss(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.items.dismissRecommendation(user.id, id);
  }
}

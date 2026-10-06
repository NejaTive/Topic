import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
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
import { CreateTopicDto } from './dto/create-topic.dto';
import {
  NotFoundResponseDto,
  TopicDetailDto,
  TopicListItemDto,
} from './dto/topic-response.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@ApiTags('topics')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Get()
  @ApiOkResponse({ type: TopicListItemDto, isArray: true })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  list(@CurrentUser() user: AuthUser): Promise<TopicListItemDto[]> {
    return this.topics.listForOwner(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: TopicDetailDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTopicDto,
  ): Promise<TopicDetailDto> {
    return this.topics.createForOwner(user.id, dto);
  }

  @Get(':id')
  @ApiOkResponse({ type: TopicDetailDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  getOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TopicDetailDto> {
    return this.topics.getOwned(user.id, id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TopicDetailDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTopicDto,
  ): Promise<TopicDetailDto> {
    return this.topics.updateOwned(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.topics.deleteOwned(user.id, id);
  }
}

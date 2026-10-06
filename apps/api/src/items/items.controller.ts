import {
  BadRequestException,
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
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UnauthorizedResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { COVER_MAX_BYTES } from '../storage/storage.service';
import { NotFoundResponseDto } from '../topics/dto/topic-response.dto';
import { CreateItemDto } from './dto/create-item.dto';
import {
  ItemDto,
  ItemListDto,
  ItemNotFoundResponseDto,
} from './dto/item-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

const coverUploadInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: COVER_MAX_BYTES },
});

@ApiTags('items')
@ApiCookieAuth(SESSION_COOKIE_NAME)
@UseGuards(AuthGuard)
@Controller('topics/:topicId/items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @ApiOkResponse({ type: ItemListDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  list(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
  ): Promise<ItemListDto> {
    return this.items.listForOwner(user.id, topicId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  create(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Body() dto: CreateItemDto,
  ): Promise<ItemDto> {
    return this.items.createForOwner(user.id, topicId, dto);
  }

  @Get(':itemId')
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  getOne(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<ItemDto> {
    return this.items.getOwned(user.id, topicId, itemId);
  }

  @Patch(':itemId')
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateItemDto,
  ): Promise<ItemDto> {
    return this.items.updateOwned(user.id, topicId, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    await this.items.deleteOwned(user.id, topicId, itemId);
  }

  @Post(':itemId/rank')
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  rank(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<ItemDto> {
    return this.items.rankOwned(user.id, topicId, itemId);
  }

  @Post(':itemId/unrank')
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  unrank(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<ItemDto> {
    return this.items.unrankOwned(user.id, topicId, itemId);
  }

  @Post(':itemId/cover')
  @UseInterceptors(coverUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Обложка ≤ 5 МБ',
        },
      },
    },
  })
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  uploadCoverPost(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ItemDto> {
    return this.uploadCover(user, topicId, itemId, file);
  }

  @Put(':itemId/cover')
  @UseInterceptors(coverUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Обложка ≤ 5 МБ',
        },
      },
    },
  })
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  uploadCoverPut(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ItemDto> {
    return this.uploadCover(user, topicId, itemId, file);
  }

  @Delete(':itemId/cover')
  @ApiOkResponse({ type: ItemDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  @ApiNotFoundResponse({ type: ItemNotFoundResponseDto })
  deleteCover(
    @CurrentUser() user: AuthUser,
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<ItemDto> {
    return this.items.deleteCoverOwned(user.id, topicId, itemId);
  }

  private uploadCover(
    user: AuthUser,
    topicId: string,
    itemId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ItemDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException({
        message: 'Файл обложки обязателен (поле file)',
        statusCode: 400,
      });
    }
    return this.items.uploadCoverOwned(user.id, topicId, itemId, file.buffer);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotFoundResponseDto } from './dto/topic-response.dto';
import {
  ForbiddenShareResponseDto,
  ShareTopicDto,
} from './dto/share-topic-response.dto';
import { TopicsService } from './topics.service';

@ApiTags('share')
@Controller('t')
export class ShareController {
  constructor(private readonly topics: TopicsService) {}

  @Get(':shareId')
  @ApiOkResponse({ type: ShareTopicDto })
  @ApiForbiddenResponse({ type: ForbiddenShareResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  getByShareId(@Param('shareId') shareId: string): Promise<ShareTopicDto> {
    return this.topics.getByShareId(shareId);
  }
}

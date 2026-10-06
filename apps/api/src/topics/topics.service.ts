import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  ItemPlacement,
  TopicPrivacy,
  type TopicPrivacy as TopicPrivacyType,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { CreateTopicDto } from './dto/create-topic.dto';
import type { ShareTopicDto } from './dto/share-topic-response.dto';
import type { TopicDetailDto, TopicListItemDto } from './dto/topic-response.dto';
import type { UpdateTopicDto } from './dto/update-topic.dto';
import { createShareId } from './share-id';

@Injectable()
export class TopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listForOwner(ownerId: string): Promise<TopicListItemDto[]> {
    const topics = await this.prisma.topic.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        privacy: true,
        updatedAt: true,
        items: {
          where: { placement: ItemPlacement.ranked },
          orderBy: { rankPosition: 'asc' },
          take: 3,
          select: { coverKey: true },
        },
      },
    });

    return topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      privacy: topic.privacy,
      updatedAt: topic.updatedAt.toISOString(),
      previewCovers: topic.items.map((item) => item.coverKey),
    }));
  }

  async createForOwner(ownerId: string, dto: CreateTopicDto): Promise<TopicDetailDto> {
    const title = dto.title.trim();
    const privacy = dto.privacy ?? TopicPrivacy.unlisted;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const topic = await this.prisma.topic.create({
          data: {
            ownerId,
            title,
            privacy,
            shareId: createShareId(),
          },
        });
        return this.toDetail(topic);
      } catch (error) {
        if (!this.isShareIdConflict(error) || attempt === 4) {
          throw error;
        }
      }
    }

    throw new Error('Не удалось сгенерировать уникальный shareId');
  }

  async getOwned(ownerId: string, topicId: string): Promise<TopicDetailDto> {
    const topic = await this.findOwnedOrThrow(ownerId, topicId);
    return this.toDetail(topic);
  }

  async updateOwned(
    ownerId: string,
    topicId: string,
    dto: UpdateTopicDto,
  ): Promise<TopicDetailDto> {
    await this.findOwnedOrThrow(ownerId, topicId);

    const data: Prisma.TopicUpdateInput = {};
    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.privacy !== undefined) {
      data.privacy = dto.privacy;
    }

    const topic = await this.prisma.topic.update({
      where: { id: topicId },
      data,
    });
    return this.toDetail(topic);
  }

  /**
   * Публичный Share (S09): без auth.
   * private → 403 (даже при угаданном shareId); нет топика → 404.
   * В ответе только ranked (inbox не отдаём).
   */
  async getByShareId(shareId: string): Promise<ShareTopicDto> {
    const topic = await this.prisma.topic.findUnique({
      where: { shareId },
      select: {
        title: true,
        privacy: true,
        owner: { select: { nick: true } },
        items: {
          where: { placement: ItemPlacement.ranked },
          orderBy: { rankPosition: 'asc' },
          select: {
            id: true,
            title: true,
            rankPosition: true,
            coverKey: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException({
        message: 'Топик не найден',
        statusCode: 404,
      });
    }

    if (topic.privacy === TopicPrivacy.private) {
      throw new ForbiddenException({
        message: 'Топик недоступен',
        statusCode: 403,
      });
    }

    return {
      title: topic.title,
      privacy: topic.privacy,
      ownerNick: topic.owner.nick,
      items: topic.items.map((item) => ({
        id: item.id,
        title: item.title,
        rankPosition: item.rankPosition as number,
        coverUrl: this.storage.coverUrl(item.coverKey),
      })),
    };
  }

  /**
   * Удаление топика владельца.
   *
   * Порядок: (1) owner-check → (2) собрать coverKey → (3) Cascade в БД →
   * (4) best-effort удаление объектов из S3/MinIO.
   */
  async deleteOwned(ownerId: string, topicId: string): Promise<void> {
    await this.findOwnedOrThrow(ownerId, topicId);

    const items = await this.prisma.item.findMany({
      where: { topicId, coverKey: { not: null } },
      select: { coverKey: true },
    });
    const coverKeys = items
      .map((item) => item.coverKey)
      .filter((key): key is string => key != null);

    await this.prisma.topic.delete({ where: { id: topicId } });
    await this.storage.deleteObjects(coverKeys);
  }

  private async findOwnedOrThrow(ownerId: string, topicId: string) {
    const topic = await this.prisma.topic.findFirst({
      where: { id: topicId, ownerId },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Топик не найден',
        statusCode: 404,
      });
    }
    return topic;
  }

  private toDetail(topic: {
    id: string;
    shareId: string;
    title: string;
    privacy: TopicPrivacyType;
    createdAt: Date;
    updatedAt: Date;
  }): TopicDetailDto {
    return {
      id: topic.id,
      shareId: topic.shareId,
      title: topic.title,
      privacy: topic.privacy,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    };
  }

  private isShareIdConflict(error: unknown): boolean {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return false;
    }
    const meta = error.meta as Record<string, unknown> | undefined;
    const parts: string[] = [error.message];
    const target = meta?.target;
    if (Array.isArray(target)) {
      parts.push(...target.map(String));
    } else if (typeof target === 'string') {
      parts.push(target);
    }
    const driver = meta?.driverAdapterError as
      | { cause?: { constraint?: { index?: string; fields?: string[] } } }
      | undefined;
    const constraint = driver?.cause?.constraint;
    if (constraint?.index) {
      parts.push(constraint.index);
    }
    if (Array.isArray(constraint?.fields)) {
      parts.push(...constraint.fields);
    }
    return parts.join(' ').toLowerCase().includes('shareid');
  }
}

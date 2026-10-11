import { Injectable } from '@nestjs/common';
import { ItemPlacement, TopicPrivacy } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { FeedDto } from './dto/feed-response.dto';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: string): Promise<FeedDto> {
    const [followingCount, topics] = await Promise.all([
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
      this.prisma.topic.findMany({
        where: {
          privacy: TopicPrivacy.public,
          ownerId: { not: userId },
          owner: {
            followers: {
              some: { followerId: userId },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          shareId: true,
          title: true,
          updatedAt: true,
          owner: { select: { nick: true } },
          items: {
            where: { placement: ItemPlacement.ranked },
            orderBy: { rankPosition: 'asc' },
            take: 3,
            select: { coverKey: true },
          },
        },
      }),
    ]);

    return {
      followingCount,
      items: topics.map((topic) => ({
        id: topic.id,
        shareId: topic.shareId,
        title: topic.title,
        updatedAt: topic.updatedAt.toISOString(),
        previewCovers: topic.items.map((item) => item.coverKey),
        ownerNick: topic.owner.nick,
      })),
    };
  }
}

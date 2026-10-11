import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ItemPlacement, TopicPrivacy } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { UserProfileDto } from './dto/user-profile-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(nickParam: string, viewerId: string | undefined): Promise<UserProfileDto> {
    const nick = nickParam.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { nick },
      select: { id: true, nick: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'Пользователь не найден',
        statusCode: 404,
      });
    }

    const publicTopicWhere = {
      ownerId: user.id,
      privacy: TopicPrivacy.public,
    };

    const [followersCount, followingCount, topicsCount, topics, followRow] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: user.id } }),
      this.prisma.follow.count({ where: { followerId: user.id } }),
      this.prisma.topic.count({ where: publicTopicWhere }),
      this.prisma.topic.findMany({
        where: publicTopicWhere,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          shareId: true,
          title: true,
          updatedAt: true,
          items: {
            where: { placement: ItemPlacement.ranked },
            orderBy: { rankPosition: 'asc' },
            take: 3,
            select: { coverKey: true },
          },
        },
      }),
      viewerId && viewerId !== user.id
        ? this.prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: user.id,
              },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    const isSelf = viewerId !== undefined && viewerId === user.id;
    const isFollowing: boolean | null =
      viewerId === undefined ? null : isSelf ? false : followRow !== null;

    return {
      nick: user.nick,
      followersCount,
      followingCount,
      topicsCount,
      isSelf,
      isFollowing,
      topics: topics.map((topic) => ({
        id: topic.id,
        shareId: topic.shareId,
        title: topic.title,
        updatedAt: topic.updatedAt.toISOString(),
        previewCovers: topic.items.map((item) => item.coverKey),
      })),
    };
  }

  async follow(followerId: string, nickParam: string): Promise<void> {
    const target = await this.findUserByNickOrThrow(nickParam);

    if (target.id === followerId) {
      throw new BadRequestException({
        message: 'Нельзя подписаться на себя',
        statusCode: 400,
      });
    }

    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId: target.id,
        },
      },
      create: {
        followerId,
        followingId: target.id,
      },
      update: {},
    });
  }

  async unfollow(followerId: string, nickParam: string): Promise<void> {
    const target = await this.findUserByNickOrThrow(nickParam);

    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: target.id,
      },
    });
  }

  private async findUserByNickOrThrow(nickParam: string): Promise<{ id: string }> {
    const nick = nickParam.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { nick },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'Пользователь не найден',
        statusCode: 404,
      });
    }

    return user;
  }
}

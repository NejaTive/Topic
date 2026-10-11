import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

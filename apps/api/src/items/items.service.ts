import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Item } from '../generated/prisma/client';
import { ItemPlacement } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { CreateItemDto } from './dto/create-item.dto';
import type { ItemDto, ItemListDto } from './dto/item-response.dto';
import type { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async listForOwner(ownerId: string, topicId: string): Promise<ItemListDto> {
    await this.findOwnedTopicOrThrow(ownerId, topicId);

    const items = await this.prisma.item.findMany({
      where: { topicId },
      orderBy: [{ placement: 'asc' }, { rankPosition: 'asc' }, { createdAt: 'desc' }],
    });

    const inbox = items
      .filter((item) => item.placement === ItemPlacement.unranked)
      .map((item) => this.toDto(item));
    const ranked = items
      .filter((item) => item.placement === ItemPlacement.ranked)
      .sort((a, b) => (a.rankPosition ?? 0) - (b.rankPosition ?? 0))
      .map((item) => this.toDto(item));

    return { inbox, ranked };
  }

  async createForOwner(
    ownerId: string,
    topicId: string,
    dto: CreateItemDto,
  ): Promise<ItemDto> {
    await this.findOwnedTopicOrThrow(ownerId, topicId);

    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.item.create({
        data: {
          topicId,
          title: dto.title.trim(),
          placement: ItemPlacement.unranked,
          rankPosition: null,
        },
      });
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return created;
    });

    return this.toDto(item);
  }

  async getOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
  ): Promise<ItemDto> {
    const item = await this.findOwnedItemOrThrow(ownerId, topicId, itemId);
    return this.toDto(item);
  }

  async updateOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
    dto: UpdateItemDto,
  ): Promise<ItemDto> {
    await this.findOwnedItemOrThrow(ownerId, topicId, itemId);

    if (dto.title === undefined) {
      throw new BadRequestException({
        message: 'Нет полей для обновления',
        statusCode: 400,
      });
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.item.update({
        where: { id: itemId },
        data: { title: dto.title!.trim() },
      });
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return updated;
    });

    return this.toDto(item);
  }

  async deleteOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
  ): Promise<void> {
    const item = await this.findOwnedItemOrThrow(ownerId, topicId, itemId);
    const coverKey = item.coverKey;
    const wasRanked = item.placement === ItemPlacement.ranked;

    await this.prisma.$transaction(async (tx) => {
      await tx.item.delete({ where: { id: itemId } });
      if (wasRanked) {
        await this.compactRanks(tx, topicId);
      }
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
    });

    if (coverKey) {
      await this.storage.deleteObjects([coverKey]);
    }
  }

  /** В конец ranked (плотный rankPosition). Уже ranked — тоже в конец. */
  async rankOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
  ): Promise<ItemDto> {
    await this.findOwnedItemOrThrow(ownerId, topicId, itemId);

    const item = await this.prisma.$transaction(async (tx) => {
      const max = await tx.item.aggregate({
        where: {
          topicId,
          placement: ItemPlacement.ranked,
          id: { not: itemId },
        },
        _max: { rankPosition: true },
      });
      const next = (max._max.rankPosition ?? 0) + 1;

      await tx.item.update({
        where: { id: itemId },
        data: {
          placement: ItemPlacement.ranked,
          rankPosition: next,
        },
      });
      await this.compactRanks(tx, topicId);
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return tx.item.findUniqueOrThrow({ where: { id: itemId } });
    });

    return this.toDto(item);
  }

  /** В inbox; сжатие рангов оставшихся ranked. */
  async unrankOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
  ): Promise<ItemDto> {
    await this.findOwnedItemOrThrow(ownerId, topicId, itemId);

    const item = await this.prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: { id: itemId },
        data: {
          placement: ItemPlacement.unranked,
          rankPosition: null,
        },
      });
      await this.compactRanks(tx, topicId);
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return tx.item.findUniqueOrThrow({ where: { id: itemId } });
    });

    return this.toDto(item);
  }

  async uploadCoverOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
    buffer: Buffer,
  ): Promise<ItemDto> {
    const item = await this.findOwnedItemOrThrow(ownerId, topicId, itemId);
    const oldKey = item.coverKey;
    const newKey = await this.storage.uploadCover(buffer);

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.item.update({
        where: { id: itemId },
        data: { coverKey: newKey },
      });
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return row;
    });

    if (oldKey) {
      await this.storage.deleteObjects([oldKey]);
    }

    return this.toDto(updated);
  }

  async deleteCoverOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
  ): Promise<ItemDto> {
    const item = await this.findOwnedItemOrThrow(ownerId, topicId, itemId);
    const oldKey = item.coverKey;

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.item.update({
        where: { id: itemId },
        data: { coverKey: null },
      });
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return row;
    });

    if (oldKey) {
      await this.storage.deleteObjects([oldKey]);
    }

    return this.toDto(updated);
  }

  private async findOwnedTopicOrThrow(ownerId: string, topicId: string) {
    const topic = await this.prisma.topic.findFirst({
      where: { id: topicId, ownerId },
      select: { id: true },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Топик не найден',
        statusCode: 404,
      });
    }
    return topic;
  }

  private async findOwnedItemOrThrow(
    ownerId: string,
    topicId: string,
    itemId: string,
  ): Promise<Item> {
    await this.findOwnedTopicOrThrow(ownerId, topicId);

    const item = await this.prisma.item.findFirst({
      where: { id: itemId, topicId },
    });
    if (!item) {
      throw new NotFoundException({
        message: 'Элемент не найден',
        statusCode: 404,
      });
    }
    return item;
  }

  private async compactRanks(
    tx: Prisma.TransactionClient,
    topicId: string,
  ): Promise<void> {
    const ranked = await tx.item.findMany({
      where: { topicId, placement: ItemPlacement.ranked },
      orderBy: { rankPosition: 'asc' },
      select: { id: true, rankPosition: true },
    });

    for (let i = 0; i < ranked.length; i += 1) {
      const row = ranked[i]!;
      const pos = i + 1;
      if (row.rankPosition !== pos) {
        await tx.item.update({
          where: { id: row.id },
          data: { rankPosition: pos },
        });
      }
    }
  }

  private toDto(item: Item): ItemDto {
    return {
      id: item.id,
      topicId: item.topicId,
      title: item.title,
      coverUrl: this.storage.coverUrl(item.coverKey),
      placement: item.placement,
      rankPosition: item.rankPosition,
      createdAt: item.createdAt.toISOString(),
    };
  }
}

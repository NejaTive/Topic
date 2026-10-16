import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TmdbClient } from '../catalog/tmdb.client';
import { Prisma, type Item } from '../generated/prisma/client';
import { ItemPlacement, TopicCategory } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { CreateItemDto } from './dto/create-item.dto';
import type { FromCatalogItemDto } from './dto/from-catalog-item.dto';
import type { ItemMetaDto } from './dto/item-meta.dto';
import type { ItemDto, ItemListDto } from './dto/item-response.dto';
import type { ReorderItemsDto } from './dto/reorder-items.dto';
import type { UpdateItemDto } from './dto/update-item.dto';
import {
  applyMoviesMetaPatch,
  metaToDto,
  moviesMetaToJson,
  normalizeMoviesMetaPatch,
  parseMoviesMeta,
  tmdbMovieSourceUrl,
  tmdbTvSourceUrl,
} from './item-meta';

const POSTER_FETCH_TIMEOUT_MS = 10_000;
const ITEM_TITLE_MAX = 200;

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly tmdb: TmdbClient,
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

  async createForOwner(ownerId: string, topicId: string, dto: CreateItemDto): Promise<ItemDto> {
    const topic = await this.findOwnedTopicOrThrow(ownerId, topicId);
    const meta = this.resolveCreateMeta(topic.category, dto.meta);

    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.item.create({
        data: {
          topicId,
          title: dto.title.trim(),
          meta,
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

  async createFromCatalogForOwner(
    ownerId: string,
    topicId: string,
    dto: FromCatalogItemDto,
  ): Promise<ItemDto> {
    const topic = await this.prisma.topic.findFirst({
      where: { id: topicId, ownerId },
      select: { id: true, category: true },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Топик не найден',
        statusCode: 404,
      });
    }
    if (topic.category !== TopicCategory.movies && topic.category !== TopicCategory.series) {
      throw new BadRequestException({
        message: 'Импорт из каталога доступен только для топиков категорий «Фильмы» и «Сериалы»',
        statusCode: 400,
      });
    }

    const sourceUrl =
      topic.category === TopicCategory.series
        ? tmdbTvSourceUrl(dto.providerId)
        : tmdbMovieSourceUrl(dto.providerId);

    const duplicate = await this.prisma.item.findFirst({
      where: {
        topicId,
        meta: {
          path: ['sourceUrl'],
          equals: sourceUrl,
        },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException({
        message:
          topic.category === TopicCategory.series
            ? 'Этот сериал уже есть в списке'
            : 'Этот фильм уже есть в списке',
        statusCode: 409,
      });
    }

    if (!this.tmdb.isConfigured()) {
      throw new ServiceUnavailableException({
        message: 'Каталог временно недоступен',
        statusCode: 503,
      });
    }

    const hit =
      topic.category === TopicCategory.series
        ? await this.tmdb.getTv(dto.providerId)
        : await this.tmdb.getMovie(dto.providerId);
    if (!hit) {
      throw new NotFoundException({
        message:
          topic.category === TopicCategory.series
            ? 'Сериал не найден в каталоге'
            : 'Фильм не найден в каталоге',
        statusCode: 404,
      });
    }

    const title = hit.title.slice(0, ITEM_TITLE_MAX);
    let coverKey: string | null = null;
    if (hit.imageUrl) {
      coverKey = await this.tryUploadCoverFromUrl(hit.imageUrl);
    }

    const meta = moviesMetaToJson({
      description: hit.description,
      director: hit.director,
      genre: hit.genre,
      country: hit.country,
      sourceUrl,
    });

    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.item.create({
        data: {
          topicId,
          title,
          coverKey,
          meta,
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

  async getOwned(ownerId: string, topicId: string, itemId: string): Promise<ItemDto> {
    const item = await this.findOwnedItemOrThrow(ownerId, topicId, itemId);
    return this.toDto(item);
  }

  async updateOwned(
    ownerId: string,
    topicId: string,
    itemId: string,
    dto: UpdateItemDto,
  ): Promise<ItemDto> {
    if (dto.title === undefined && dto.meta === undefined) {
      throw new BadRequestException({
        message: 'Нет полей для обновления',
        statusCode: 400,
      });
    }

    const topic = await this.findOwnedTopicOrThrow(ownerId, topicId);
    const existing = await this.findOwnedItemOrThrow(ownerId, topicId, itemId);

    const data: Prisma.ItemUpdateInput = {};
    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.meta !== undefined) {
      data.meta = this.resolveUpdateMeta(topic.category, existing.meta, dto.meta);
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.item.update({
        where: { id: itemId },
        data,
      });
      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
      return updated;
    });

    return this.toDto(item);
  }

  async deleteOwned(ownerId: string, topicId: string, itemId: string): Promise<void> {
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

  /**
   * Полная перестановка ranked одной транзакцией.
   * `orderedItemIds` — точная перестановка всех ranked id топика → rankPosition 1…N.
   */
  async reorderRankedOwned(
    ownerId: string,
    topicId: string,
    dto: ReorderItemsDto,
  ): Promise<ItemListDto> {
    await this.findOwnedTopicOrThrow(ownerId, topicId);

    await this.prisma.$transaction(async (tx) => {
      const ranked = await tx.item.findMany({
        where: { topicId, placement: ItemPlacement.ranked },
        select: { id: true },
      });
      const rankedIds = new Set(ranked.map((row) => row.id));
      const ordered = dto.orderedItemIds;
      const orderedUnique = new Set(ordered);

      if (ordered.length !== rankedIds.size || orderedUnique.size !== ordered.length) {
        throw new UnprocessableEntityException({
          message:
            'orderedItemIds должен содержать ровно все ranked-элементы топика без дубликатов',
          statusCode: 422,
        });
      }

      for (const id of ordered) {
        if (!rankedIds.has(id)) {
          throw new UnprocessableEntityException({
            message: 'orderedItemIds содержит id вне ranked этого топика',
            statusCode: 422,
          });
        }
      }

      if (ordered.length > 0) {
        const values = ordered.map(
          (id, index) => Prisma.sql`(${id}, CAST(${index + 1} AS integer))`,
        );
        await tx.$executeRaw`
          UPDATE "Item" AS i
          SET "rankPosition" = v.pos
          FROM (VALUES ${Prisma.join(values)}) AS v(id, pos)
          WHERE i.id = v.id
            AND i."topicId" = ${topicId}
            AND i.placement = CAST('ranked' AS "ItemPlacement")
        `;
      }

      await tx.topic.update({
        where: { id: topicId },
        data: { updatedAt: new Date() },
      });
    });

    return this.listForOwner(ownerId, topicId);
  }

  /** В конец ranked (плотный rankPosition). Уже ranked — тоже в конец. */
  async rankOwned(ownerId: string, topicId: string, itemId: string): Promise<ItemDto> {
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
  async unrankOwned(ownerId: string, topicId: string, itemId: string): Promise<ItemDto> {
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

  async deleteCoverOwned(ownerId: string, topicId: string, itemId: string): Promise<ItemDto> {
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
      select: { id: true, category: true },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Топик не найден',
        statusCode: 404,
      });
    }
    return topic;
  }

  private resolveCreateMeta(
    category: TopicCategory,
    meta: ItemMetaDto | undefined,
  ): Prisma.InputJsonValue | typeof Prisma.DbNull {
    if (meta === undefined) {
      return Prisma.DbNull;
    }
    if (category !== TopicCategory.movies && category !== TopicCategory.series) {
      throw new BadRequestException({
        message: 'Поля meta доступны только для топиков категорий «Фильмы» и «Сериалы»',
        statusCode: 400,
      });
    }
    return moviesMetaToJson(normalizeMoviesMetaPatch(meta));
  }

  private resolveUpdateMeta(
    category: TopicCategory,
    existing: Prisma.JsonValue,
    patch: ItemMetaDto,
  ): Prisma.InputJsonValue | typeof Prisma.DbNull {
    if (category !== TopicCategory.movies && category !== TopicCategory.series) {
      throw new BadRequestException({
        message: 'Поля meta доступны только для топиков категорий «Фильмы» и «Сериалы»',
        statusCode: 400,
      });
    }
    return moviesMetaToJson(applyMoviesMetaPatch(parseMoviesMeta(existing), patch));
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

  private async compactRanks(tx: Prisma.TransactionClient, topicId: string): Promise<void> {
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

  private async tryUploadCoverFromUrl(imageUrl: string): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POSTER_FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(imageUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      if (!res.ok) {
        this.logger.warn(`poster fetch HTTP ${res.status}`);
        return null;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (!buffer.length) {
        return null;
      }

      return await this.storage.uploadCover(buffer);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown';
      this.logger.warn(`poster → MinIO skipped: ${reason}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private toDto(item: Item): ItemDto {
    return {
      id: item.id,
      topicId: item.topicId,
      title: item.title,
      coverUrl: this.storage.coverUrl(item.coverKey),
      meta: metaToDto(item.meta),
      placement: item.placement,
      rankPosition: item.rankPosition,
      createdAt: item.createdAt.toISOString(),
    };
  }
}

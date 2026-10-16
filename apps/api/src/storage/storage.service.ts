import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { detectImageMime, isAllowedImageMime } from './image-mime';

export const COVER_MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client!: S3Client;
  private bucket!: string;
  private publicBaseUrl!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const endpoint = this.config.getOrThrow<string>('S3_ENDPOINT');
    const accessKeyId = this.config.getOrThrow<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.config.getOrThrow<string>('S3_SECRET_KEY');
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.publicBaseUrl = this.config.getOrThrow<string>('S3_PUBLIC_URL').replace(/\/$/, '');

    this.client = new S3Client({
      endpoint,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /**
   * Публичный URL обложки для браузера.
   * Same-origin path `/{bucket}/{key}` (Caddy → MinIO); если S3_PUBLIC_URL задан —
   * абсолютный `{S3_PUBLIC_URL}/{bucket}/{key}` (dev MinIO / будущий CDN).
   */
  coverUrl(coverKey: string | null | undefined): string | null {
    if (!coverKey) {
      return null;
    }
    const path = `/${this.bucket}/${coverKey}`;
    if (!this.publicBaseUrl || this.publicBaseUrl === '.') {
      return path;
    }
    return `${this.publicBaseUrl}${path}`;
  }

  /**
   * Проверка MIME (magic bytes) → sharp webp (EXIF сбрасывается) → PutObject.
   * Возвращает новый случайный ключ `covers/{uuid}.webp`.
   */
  async uploadCover(buffer: Buffer): Promise<string> {
    if (buffer.length > COVER_MAX_BYTES) {
      throw new PayloadTooLargeException({
        message: 'Файл обложки больше 5 МБ',
        statusCode: 413,
      });
    }

    const mime = detectImageMime(buffer);
    if (!isAllowedImageMime(mime)) {
      throw new BadRequestException({
        message: 'Обложка должна быть JPEG, PNG, WebP или GIF',
        statusCode: 400,
      });
    }

    let webp: Buffer;
    try {
      // rotate() применяет EXIF-ориентацию; webp без метаданных — срез EXIF.
      webp = await sharp(buffer).rotate().webp({ quality: 85 }).toBuffer();
    } catch {
      throw new BadRequestException({
        message: 'Не удалось обработать изображение обложки',
        statusCode: 400,
      });
    }

    const key = `covers/${randomUUID()}.webp`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: webp,
        ContentType: 'image/webp',
      }),
    );
    return key;
  }

  /**
   * Копия объекта обложки под новый ключ `covers/{uuid}.webp`.
   * Не шарить один coverKey между Item — delete/replace удаляет объект.
   */
  async copyCover(sourceKey: string): Promise<string> {
    const out = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: sourceKey }),
    );
    const bytes = await out.Body?.transformToByteArray();
    if (!bytes?.length) {
      throw new BadRequestException({
        message: 'Не удалось скопировать обложку',
        statusCode: 400,
      });
    }

    const key = `covers/${randomUUID()}.webp`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.from(bytes),
        ContentType: out.ContentType ?? 'image/webp',
      }),
    );
    return key;
  }

  /** Best-effort удаление; ошибки логируем и глотаем (после Cascade в БД). */
  async deleteObjects(keys: string[]): Promise<void> {
    const unique = [...new Set(keys.filter(Boolean))];
    for (const key of unique) {
      try {
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      } catch (error) {
        this.logger.warn(`storage: не удалось удалить ${key}`, error);
      }
    }
  }
}

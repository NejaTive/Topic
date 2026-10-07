import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { sessionExpiresAt } from './cookie';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import { createSessionToken, hashSessionToken } from './session-token';

type AuthUser = UserResponseDto;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<{ user: AuthUser; token: string }> {
    const email = dto.email.trim();
    const nick = dto.nick.trim().toLowerCase();
    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: { email, nick, passwordHash },
        select: { id: true, email: true, nick: true },
      });
      const token = await this.createSession(user.id);
      return { user, token };
    } catch (error) {
      this.rethrowUniqueConflict(error);
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ user: AuthUser; token: string }> {
    const email = dto.email.trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const invalid = new UnauthorizedException({
      message: 'Неверный email или пароль',
      statusCode: 401,
    });

    if (!user) {
      // Константная работа, чтобы не утекать timing «нет email».
      await argon2.hash(dto.password);
      throw invalid;
    }

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      throw invalid;
    }

    const token = await this.createSession(user.id);
    return {
      user: { id: user.id, email: user.email, nick: user.nick },
      token,
    };
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }
    const tokenHash = hashSessionToken(token);
    await this.prisma.session.deleteMany({ where: { tokenHash } });
  }

  async resolveSessionUser(token: string | undefined): Promise<AuthUser | null> {
    if (!token) {
      return null;
    }

    const tokenHash = hashSessionToken(token);
    const session = await this.prisma.session.findFirst({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, nick: true } } },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      return null;
    }

    return session.user;
  }

  async requireSessionUser(token: string | undefined): Promise<AuthUser> {
    const user = await this.resolveSessionUser(token);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Требуется авторизация',
        statusCode: 401,
      });
    }
    return user;
  }

  private async createSession(userId: string): Promise<string> {
    const { token, tokenHash } = createSessionToken();
    await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt: sessionExpiresAt(),
      },
    });
    return token;
  }

  private rethrowUniqueConflict(error: unknown): void {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      return;
    }

    const field = this.uniqueConflictField(error);
    if (field === 'nick') {
      throw new ConflictException({ message: 'nick занят', field: 'nick' });
    }
    if (field === 'email') {
      throw new ConflictException({ message: 'email занят', field: 'email' });
    }
    throw new ConflictException({ message: 'Конфликт уникальности', field: 'email' });
  }

  /** Prisma 7 + driver adapter: constraint в meta.driverAdapterError, не meta.target. */
  private uniqueConflictField(
    error: Prisma.PrismaClientKnownRequestError,
  ): 'email' | 'nick' | null {
    const meta = error.meta as Record<string, unknown> | undefined;
    const parts: string[] = [error.message];

    const target = meta?.target;
    if (Array.isArray(target)) {
      parts.push(...target.map(String));
    } else if (typeof target === 'string') {
      parts.push(target);
    }

    const driver = meta?.driverAdapterError as
      { cause?: { constraint?: { index?: string; fields?: string[] } } } | undefined;
    const constraint = driver?.cause?.constraint;
    if (constraint?.index) {
      parts.push(constraint.index);
    }
    if (Array.isArray(constraint?.fields)) {
      parts.push(...constraint.fields);
    }

    const haystack = parts.join(' ').toLowerCase();
    if (haystack.includes('nick')) {
      return 'nick';
    }
    if (haystack.includes('email')) {
      return 'email';
    }
    return null;
  }
}

export type { AuthUser };

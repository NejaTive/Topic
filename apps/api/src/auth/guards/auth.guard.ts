import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_COOKIE_NAME } from '../auth.constants';
import { AuthService, type AuthUser } from '../auth.service';
import { readCookie } from '../cookie';

export type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const token = readCookie(req, SESSION_COOKIE_NAME);
    const user = await this.auth.resolveSessionUser(token);

    if (!user) {
      throw new UnauthorizedException({
        message: 'Требуется авторизация',
        statusCode: 401,
      });
    }

    req.user = user;
    return true;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SESSION_COOKIE_NAME } from '../auth.constants';
import { AuthService } from '../auth.service';
import { readCookie } from '../cookie';
import type { RequestWithUser } from './auth.guard';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const token = readCookie(req, SESSION_COOKIE_NAME);
    const user = await this.auth.resolveSessionUser(token);
    if (user) {
      req.user = user;
    }
    return true;
  }
}

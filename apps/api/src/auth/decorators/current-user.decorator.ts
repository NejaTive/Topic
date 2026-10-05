import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../auth.service';
import type { RequestWithUser } from '../guards/auth.guard';

/** Текущий пользователь после AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!req.user) {
      throw new Error('CurrentUser used without AuthGuard');
    }
    return req.user;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/authenticated-user';

/**
 * Inyecta el usuario autenticado (`req.user`) en un parámetro del handler.
 * Será `undefined` si la ruta no pasó por `JwtAuthGuard`.
 *
 * @example `metodo(@CurrentUser() user: AuthenticatedUser) { ... }`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    return request.user;
  },
);

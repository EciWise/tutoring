import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../shared/domain/enums/rol-usuario.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../types/authenticated-user';

/**
 * Autoriza por rol según `@Roles(...)`. Si el handler no declara roles, permite
 * el paso (la autenticación la cubre `JwtAuthGuard`). Asume que un guard previo
 * ya pobló `req.user`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RolUsuario[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }
    if (!required.includes(user.rol)) {
      throw new ForbiddenException(
        'No tiene el rol requerido para esta operación',
      );
    }
    return true;
  }
}

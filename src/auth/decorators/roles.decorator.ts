import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../shared/domain/enums/rol-usuario.enum';

export const ROLES_KEY = 'roles';

/**
 * Restringe un handler/controller a los roles indicados. Requiere `RolesGuard`
 * (y `JwtAuthGuard` antes, para poblar `req.user`).
 *
 * @example `@Roles(RolUsuario.TUTOR) @UseGuards(JwtAuthGuard, RolesGuard)`
 */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);

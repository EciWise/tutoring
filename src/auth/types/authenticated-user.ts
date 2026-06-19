import { RolUsuario } from '../../shared/domain/enums/rol-usuario.enum';

/**
 * Usuario autenticado tal como `JwtStrategy.validate` lo deja en `req.user`.
 * Derivado de los claims del JWT de `auth` (`sub`→`id`). No incluye `estado`
 * ni `carrera` (no están en el token — ver gaps documentados en CLAUDE.md §7).
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
}

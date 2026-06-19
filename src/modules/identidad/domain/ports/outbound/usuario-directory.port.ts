import { RolUsuario } from '../../../../../shared/domain/enums/rol-usuario.enum';

/** Token de inyección del puerto de directorio de usuarios. */
export const USUARIO_DIRECTORY_PORT = Symbol('USUARIO_DIRECTORY_PORT');

/** Claims relevantes capturados del JWT para el espejo local. */
export interface JwtUserClaims {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
}

/** Vista de lectura de un usuario del espejo local `usuario_local`. */
export interface UsuarioLocalView {
  userId: string;
  nombre: string;
  apellido: string;
  email: string | null;
  rol: RolUsuario;
}

/**
 * Puerto de salida hacia el espejo local de usuarios (captura perezosa desde el
 * JWT). Existe porque `auth` no expone lookup ni eventos; el día que lo haga,
 * solo cambia el adapter, no este contrato. Sirve lecturas de nombre/apellido
 * en vistas (RF-18, RF-24, RF-25) sin llamar a `auth`.
 */
export interface IUsuarioDirectoryPort {
  getById(userId: string): Promise<UsuarioLocalView | null>;
  getMany(userIds: string[]): Promise<UsuarioLocalView[]>;
  upsertFromJwt(claims: JwtUserClaims): Promise<void>;
}

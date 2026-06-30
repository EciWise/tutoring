import { ConflictError } from '../../domain/errors/domain-error';
import { Prisma } from './prisma-client';

/**
 * Traduce una violación de unicidad de Prisma (`P2002`) a `ConflictError` de
 * dominio; cualquier otro error se relanza intacto. Patrón "confiar en el
 * `@@unique` de la BD" en vez de pre-leer para detectar duplicados.
 */
export function mapUniqueViolation(error: unknown, mensaje: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ConflictError(mensaje);
  }
  throw error;
}

/**
 * Traduce una violación de clave foránea de Prisma (`P2003`) a `ConflictError`
 * de dominio; típico al borrar una fila aún referenciada por una FK con
 * `onDelete: Restrict`. Cualquier otro error se relanza intacto.
 */
export function mapForeignKeyViolation(error: unknown, mensaje: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    throw new ConflictError(mensaje);
  }
  throw error;
}

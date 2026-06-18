/**
 * Roles del ecosistema, emitidos por el servicio `auth` dentro del JWT (claim `rol`).
 * Los valores coinciden exactamente con el enum `RolUsuario` de Prisma y con el
 * claim del token; no traducir ni renombrar sin alinear las tres fuentes.
 */
export enum RolUsuario {
  ESTUDIANTE = 'estudiante',
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

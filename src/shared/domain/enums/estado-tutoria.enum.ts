/**
 * Estado del ciclo de vida de una tutoría. Valores idénticos al enum
 * `EstadoTutoria` de Prisma. Una tutoría nace PROGRAMADA (al materializarse),
 * pasa a REALIZADA o CANCELADA.
 */
export enum EstadoTutoria {
  PROGRAMADA = 'PROGRAMADA',
  REALIZADA = 'REALIZADA',
  CANCELADA = 'CANCELADA',
}

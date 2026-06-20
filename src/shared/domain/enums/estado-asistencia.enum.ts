/**
 * Estado de la participación de un estudiante en una tutoría. Valores idénticos
 * al enum `EstadoAsistencia` de Prisma. Nace CONFIRMADA (al reservar); el tutor
 * la marca ASISTIDA/INASISTIDA (asistencia, fase posterior); el estudiante o el
 * tutor la llevan a CANCELADA.
 */
export enum EstadoAsistencia {
  CONFIRMADA = 'CONFIRMADA',
  ASISTIDA = 'ASISTIDA',
  INASISTIDA = 'INASISTIDA',
  CANCELADA = 'CANCELADA',
}

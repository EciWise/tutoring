/**
 * Modalidad de una tutoría/disponibilidad. Los valores coinciden exactamente con
 * el enum `Modalidad` de Prisma; no traducir ni renombrar sin alinear ambas
 * fuentes. La coherencia modalidad↔sala (PRESENCIAL exige sala; VIRTUAL la
 * admite opcional) se valida en los agregados, no aquí.
 */
export enum Modalidad {
  VIRTUAL = 'VIRTUAL',
  PRESENCIAL = 'PRESENCIAL',
}

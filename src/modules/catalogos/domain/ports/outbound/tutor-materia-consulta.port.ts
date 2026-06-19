/** Token de inyección del puerto público de consulta tutor-materia. */
export const TUTOR_MATERIA_CONSULTA = Symbol('TUTOR_MATERIA_CONSULTA');

/**
 * Puerto **público** de `catalogos` para que otros slices (p.ej. `disponibilidad`)
 * verifiquen RN-03/RN-05 sin acceder a los internals de catalogos. Contrato
 * mínimo de solo lectura.
 */
export interface ITutorMateriaConsultaPort {
  /** ¿La materia está asignada y autorizada para ese tutor? */
  estaAutorizada(tutorUserId: string, materiaId: string): Promise<boolean>;
}

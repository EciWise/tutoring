import { TutorMateria } from '../../entities/tutor-materia.entity';

/** Token de inyección del repositorio de asignaciones tutor-materia. */
export const TUTOR_MATERIA_REPOSITORY = Symbol('TUTOR_MATERIA_REPOSITORY');

/** Puerto de salida de persistencia de asignaciones tutor-materia. */
export interface ITutorMateriaRepository {
  guardar(tutorMateria: TutorMateria): Promise<void>;
  actualizar(tutorMateria: TutorMateria): Promise<void>;
  obtenerPorId(id: string): Promise<TutorMateria | null>;
  listarPorTutor(tutorUserId: string): Promise<TutorMateria[]>;
}

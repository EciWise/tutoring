import { Tutoria } from '../../entities/tutoria.entity';

/** Token de inyección del repositorio de escritura de tutorías. */
export const TUTORIA_REPOSITORY = Symbol('TUTORIA_REPOSITORY');

/**
 * Puerto de salida de escritura del agregado `Tutoria`. Es la API pública del
 * slice `tutorias` para que el job de materialización (slice `disponibilidad`)
 * persista los slots. `guardar` lanza `ConflictError` si la tutoría ya existe
 * (`@@unique (tutor, franja, fecha)`), lo que el job usa para ser idempotente.
 */
export interface ITutoriaRepository {
  guardar(tutoria: Tutoria): Promise<void>;
}

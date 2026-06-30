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
  /**
   * Cancela (PROGRAMADA → CANCELADA) todas las tutorías futuras originadas por
   * `disponibilidadId` cuya fecha sea >= `desde`. Se llama al desactivar la
   * plantilla para que el estudiante no vea slots que el tutor ya no ofrece.
   */
  cancelarFuturasPorDisponibilidad(
    disponibilidadId: string,
    desde: Date,
  ): Promise<number>;
  /**
   * Re-activa (CANCELADA → PROGRAMADA) las tutorías futuras de `disponibilidadId`
   * cuya fecha sea >= `desde`. Se llama al re-publicar una plantilla para que el
   * estudiante vuelva a ver los slots existentes sin necesidad de re-crearlos.
   */
  reactivarCanceladasPorDisponibilidad(
    disponibilidadId: string,
    desde: Date,
  ): Promise<number>;
}

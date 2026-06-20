import { EstadoTutoria } from '../../../../../shared/domain/enums/estado-tutoria.enum';
import { Participante } from '../../entities/participante.entity';

/** Token de inyección del repositorio transaccional de reservas. */
export const RESERVA_REPOSITORY = Symbol('RESERVA_REPOSITORY');

/** Vista mínima de la tutoría que necesitan las reglas de reserva. */
export interface TutoriaParaReserva {
  id: string;
  tutorUserId: string;
  fecha: Date;
  franjaId: string;
  estado: EstadoTutoria;
  cuposMaximos: number;
  cuposOcupados: number;
}

/** Datos para cancelar la reserva en origen al reprogramar. */
export interface CancelacionOrigen {
  tutoriaId: string;
  estudianteUserId: string;
  motivo: string;
}

/**
 * Puerto de salida de `reservas`. Las operaciones de escritura son
 * **transaccionales y atómicas** (cupo + participante en una sola `$transaction`);
 * el control de cupo (RN-09) usa un UPDATE condicional `WHERE cupos_ocupados <
 * cupos_maximos`. Lanzan `ConflictError` (409) cuando no hay cupo o hay doble
 * inscripción.
 */
export interface IReservaRepository {
  buscarTutoriaParaReserva(
    tutoriaId: string,
  ): Promise<TutoriaParaReserva | null>;

  /** RN-01: ¿el estudiante ya tiene una participación activa en esa fecha+franja? */
  estudianteTieneTraslape(
    estudianteUserId: string,
    fecha: Date,
    franjaId: string,
    excluirTutoriaId?: string,
  ): Promise<boolean>;

  obtenerParticipanteActivo(
    tutoriaId: string,
    estudianteUserId: string,
  ): Promise<Participante | null>;

  reservar(participante: Participante): Promise<void>;

  cancelarReserva(participante: Participante): Promise<void>;

  reprogramar(origen: CancelacionOrigen, destino: Participante): Promise<void>;

  /** Cancela la tutoría y libera a todos sus participantes. Devuelve cuántos liberó. */
  cancelarTutoria(tutoriaId: string, motivo: string): Promise<number>;
}

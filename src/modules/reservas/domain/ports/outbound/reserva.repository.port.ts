import { EstadoAsistencia } from '../../../../../shared/domain/enums/estado-asistencia.enum';
import { EstadoTutoria } from '../../../../../shared/domain/enums/estado-tutoria.enum';
import { Participante } from '../../entities/participante.entity';

/** Token de inyección del repositorio transaccional de reservas. */
export const RESERVA_REPOSITORY = Symbol('RESERVA_REPOSITORY');

/** Vista de la participación de un estudiante en una sesión del tutor. */
export interface ParticipanteEnSesion {
  id: string;
  tutoriaId: string;
  estudianteUserId: string;
  estadoAsistencia: EstadoAsistencia;
  temaEspecifico: string | null;
  descripcionDudas: string | null;
  canceladoEn: Date | null;
  motivoCancelacion: string | null;
  sesion: {
    fecha: Date;
    horaInicio: string;
    horaFin: string;
    modalidad: string;
    estado: string;
    materiaId: string;
    materiaCodigo: string;
    materiaNombre: string;
    salaCodigo: string | null;
    enlaceVirtual: string | null;
  };
}

/** Vista detallada de una reserva con datos de la tutoría para el estudiante. */
export interface ReservaConDetalle {
  id: string;
  tutoriaId: string;
  estudianteUserId: string;
  estadoAsistencia: EstadoAsistencia;
  temaEspecifico: string | null;
  descripcionDudas: string | null;
  canceladoEn: Date | null;
  motivoCancelacion: string | null;
  tutoria: {
    fecha: Date;
    horaInicio: string; // 'HH:MM' extraído de Time
    horaFin: string; // 'HH:MM' extraído de Time
    modalidad: string;
    estado: string;
    materiaId: string;
    materiaCodigo: string;
    materiaNombre: string;
    tutorUserId: string;
    salaCodigo: string | null;
    enlaceVirtual: string | null;
  };
}

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

  /**
   * Marca la tutoría como REALIZADA (solo si estaba PROGRAMADA) y devuelve los
   * userId de los participantes activos (no cancelados). Atómico.
   */
  finalizarTutoria(tutoriaId: string): Promise<string[]>;

  /**
   * Registra la evaluación (1-5) del estudiante a su tutor sobre una tutoría
   * REALIZADA (RF-13). Es idempotente por la unicidad de `participante` (RN-07):
   * lanza ConflictError si ya calificó. Devuelve el `tutorUserId` para el evento.
   */
  calificarTutoria(input: {
    tutoriaId: string;
    estudianteUserId: string;
    calificacion: number;
    comentario?: string | null;
  }): Promise<{ tutorUserId: string }>;

  /** RF-05: lista todas las reservas de un estudiante con detalle de la tutoría. */
  listarPorEstudiante(estudianteUserId: string): Promise<ReservaConDetalle[]>;

  /** Lista todas las participaciones en sesiones propias del tutor. */
  listarParticipantesDeTutor(
    tutorUserId: string,
  ): Promise<ParticipanteEnSesion[]>;
}

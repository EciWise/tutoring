import { DisponibilidadTutor } from '../../entities/disponibilidad-tutor.entity';

/** Token de inyección del repositorio de disponibilidades. */
export const DISPONIBILIDAD_REPOSITORY = Symbol('DISPONIBILIDAD_REPOSITORY');

/** Puerto de salida de persistencia de plantillas de disponibilidad. */
export interface IDisponibilidadRepository {
  guardar(disponibilidad: DisponibilidadTutor): Promise<void>;
  actualizar(disponibilidad: DisponibilidadTutor): Promise<void>;
  obtenerPorId(id: string): Promise<DisponibilidadTutor | null>;
  listarPorTutor(tutorUserId: string): Promise<DisponibilidadTutor[]>;
  /** Activas, para que el job de materialización las expanda. */
  listarActivas(): Promise<DisponibilidadTutor[]>;
}

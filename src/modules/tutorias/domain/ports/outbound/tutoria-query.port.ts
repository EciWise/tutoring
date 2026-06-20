import { EstadoTutoria } from '../../../../../shared/domain/enums/estado-tutoria.enum';
import { Modalidad } from '../../../../../shared/domain/enums/modalidad.enum';

/** Token de inyección del puerto de consulta (lectura) de tutorías. */
export const TUTORIA_QUERY = Symbol('TUTORIA_QUERY');

export interface BuscarTutoriasFiltros {
  materiaId?: string;
  modalidad?: Modalidad;
  fecha?: Date;
  tutorUserId?: string;
}

/** Proyección de lectura de un slot de tutoría (con datos de franja/materia/sala). */
export interface TutoriaResumen {
  id: string;
  tutorUserId: string;
  fecha: Date;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  materiaId: string;
  materiaCodigo: string;
  materiaNombre: string;
  modalidad: Modalidad;
  salaCodigo: string | null;
  enlaceVirtual: string | null;
  cuposMaximos: number;
  cuposDisponibles: number;
}

export interface TutoriaDetalle extends TutoriaResumen {
  estado: EstadoTutoria;
  temaGeneral: string | null;
}

/**
 * Puerto de lectura (CQRS) de tutorías. Devuelve proyecciones planas, no el
 * agregado; el nombre del tutor lo enriquece el caso de uso vía
 * `IUsuarioDirectoryPort`, no este puerto.
 */
export interface ITutoriaQueryPort {
  /** Slots PROGRAMADOS con cupo disponible que cumplan los filtros (RF-04). */
  buscar(filtros: BuscarTutoriasFiltros): Promise<TutoriaResumen[]>;
  obtenerDetalle(id: string): Promise<TutoriaDetalle | null>;
}

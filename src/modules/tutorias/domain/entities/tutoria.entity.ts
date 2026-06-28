import { randomUUID } from 'node:crypto';
import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Cupos } from '../../../../shared/domain/value-objects/cupos.vo';

interface TutoriaProps {
  id: string;
  tutorUserId: string;
  franjaId: string;
  fecha: Date;
  materiaId: string;
  salaId: string | null;
  disponibilidadId: string | null;
  modalidad: Modalidad;
  estado: EstadoTutoria;
  cupos: Cupos;
  enlaceVirtual: string | null;
  temaGeneral: string | null;
  motivoCancelacion: string | null;
}

/**
 * `Tutoria` — Aggregate Root y slot materializado del sistema. En Fase 3 solo se
 * crea (al materializar una disponibilidad) y se lee; la mutación por reservas,
 * asistencia y cancelación llega en fases posteriores.
 *
 * Invariante de coherencia modalidad↔sala: PRESENCIAL exige sala; VIRTUAL la
 * admite opcional (puede dictarse desde un salón físico). El `enlaceVirtual` se
 * asigna por sesión más adelante (queda `null` al programar); la BD lo tiene nullable.
 */
export class Tutoria {
  private constructor(private readonly props: TutoriaProps) {}

  /** Materializa una tutoría PROGRAMADA a partir de los datos de una disponibilidad. */
  public static programar(input: {
    tutorUserId: string;
    franjaId: string;
    fecha: Date;
    materiaId: string;
    salaId?: string | null;
    modalidad: Modalidad;
    cuposMaximos: number;
    disponibilidadId?: string | null;
  }): Tutoria {
    const salaId = input.salaId ?? null;
    Tutoria.validarCoherencia(input.modalidad, salaId);
    return new Tutoria({
      id: randomUUID(),
      tutorUserId: input.tutorUserId,
      franjaId: input.franjaId,
      fecha: input.fecha,
      materiaId: input.materiaId,
      salaId,
      disponibilidadId: input.disponibilidadId ?? null,
      modalidad: input.modalidad,
      estado: EstadoTutoria.PROGRAMADA,
      cupos: Cupos.crear(input.cuposMaximos, 0),
      enlaceVirtual: null,
      temaGeneral: null,
      motivoCancelacion: null,
    });
  }

  public static reconstituir(props: {
    id: string;
    tutorUserId: string;
    franjaId: string;
    fecha: Date;
    materiaId: string;
    salaId: string | null;
    disponibilidadId: string | null;
    modalidad: Modalidad;
    estado: EstadoTutoria;
    cuposMaximos: number;
    cuposOcupados: number;
    enlaceVirtual: string | null;
    temaGeneral: string | null;
    motivoCancelacion: string | null;
  }): Tutoria {
    return new Tutoria({
      id: props.id,
      tutorUserId: props.tutorUserId,
      franjaId: props.franjaId,
      fecha: props.fecha,
      materiaId: props.materiaId,
      salaId: props.salaId,
      disponibilidadId: props.disponibilidadId,
      modalidad: props.modalidad,
      estado: props.estado,
      cupos: Cupos.crear(props.cuposMaximos, props.cuposOcupados),
      enlaceVirtual: props.enlaceVirtual,
      temaGeneral: props.temaGeneral,
      motivoCancelacion: props.motivoCancelacion,
    });
  }

  private static validarCoherencia(
    modalidad: Modalidad,
    salaId: string | null,
  ): void {
    // La sala es opcional en ambas modalidades (una tutoría VIRTUAL puede
    // dictarse desde un salón físico). Solo PRESENCIAL exige sala.
    if (modalidad === Modalidad.PRESENCIAL && !salaId) {
      throw new ValidationError(
        'Una tutoría PRESENCIAL requiere una sala asignada.',
      );
    }
  }

  /** Hay cupo si está PROGRAMADA y no se ha alcanzado el máximo. */
  public tieneCupo(): boolean {
    return (
      this.props.estado === EstadoTutoria.PROGRAMADA &&
      this.props.cupos.hayCupo()
    );
  }

  public get id(): string {
    return this.props.id;
  }

  public get tutorUserId(): string {
    return this.props.tutorUserId;
  }

  public get franjaId(): string {
    return this.props.franjaId;
  }

  public get fecha(): Date {
    return this.props.fecha;
  }

  public get materiaId(): string {
    return this.props.materiaId;
  }

  public get salaId(): string | null {
    return this.props.salaId;
  }

  public get disponibilidadId(): string | null {
    return this.props.disponibilidadId;
  }

  public get modalidad(): Modalidad {
    return this.props.modalidad;
  }

  public get estado(): EstadoTutoria {
    return this.props.estado;
  }

  public get cuposMaximos(): number {
    return this.props.cupos.maximos;
  }

  public get cuposOcupados(): number {
    return this.props.cupos.ocupados;
  }

  public get enlaceVirtual(): string | null {
    return this.props.enlaceVirtual;
  }
}

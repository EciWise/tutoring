import { randomUUID } from 'node:crypto';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import {
  BusinessRuleViolation,
  ValidationError,
} from '../../../../shared/domain/errors/domain-error';
import { Cupos } from '../../../../shared/domain/value-objects/cupos.vo';
import { Tutoria } from '../../../tutorias/domain/entities/tutoria.entity';
import { isoDow } from '../fecha.util';
import { RangoVigencia } from '../value-objects/rango-vigencia.vo';

interface DisponibilidadTutorProps {
  id: string;
  tutorUserId: string;
  franjaId: string;
  franjaDiaSemana: number;
  materiaId: string;
  salaId: string | null;
  modalidad: Modalidad;
  cupos: Cupos;
  vigencia: RangoVigencia;
  activa: boolean;
}

/** Campos editables de una disponibilidad (no se cambian tutor ni franja). */
interface CambiosDisponibilidad {
  materiaId?: string;
  salaId?: string | null;
  modalidad?: Modalidad;
  cuposMaximos?: number;
  vigenciaDesde?: Date;
  vigenciaHasta?: Date;
}

/**
 * `DisponibilidadTutor` — Aggregate Root: plantilla recurrente declarada por el
 * tutor para una franja institucional. Invariantes: vigencia coherente
 * (`hasta>=desde`), `cuposMaximos>=1`, y coherencia modalidad↔sala: PRESENCIAL
 * exige sala; VIRTUAL la admite opcional (puede dictarse desde un salón físico).
 * La unicidad `(tutor, franja)` (RN-02) la garantiza
 * la BD. `franjaDiaSemana` es un dato de la franja referenciada (hidratado por
 * join) usado para materializar.
 */
export class DisponibilidadTutor {
  private constructor(private props: DisponibilidadTutorProps) {}

  public static crear(input: {
    tutorUserId: string;
    franjaId: string;
    franjaDiaSemana: number;
    materiaId: string;
    salaId?: string | null;
    modalidad: Modalidad;
    cuposMaximos: number;
    vigenciaDesde: Date;
    vigenciaHasta: Date;
  }): DisponibilidadTutor {
    const salaId = input.salaId ?? null;
    DisponibilidadTutor.validarCoherencia(input.modalidad, salaId);
    return new DisponibilidadTutor({
      id: randomUUID(),
      tutorUserId: input.tutorUserId,
      franjaId: input.franjaId,
      franjaDiaSemana: input.franjaDiaSemana,
      materiaId: input.materiaId,
      salaId,
      modalidad: input.modalidad,
      cupos: Cupos.crear(input.cuposMaximos),
      vigencia: RangoVigencia.crear(input.vigenciaDesde, input.vigenciaHasta),
      activa: true,
    });
  }

  public static reconstituir(props: {
    id: string;
    tutorUserId: string;
    franjaId: string;
    franjaDiaSemana: number;
    materiaId: string;
    salaId: string | null;
    modalidad: Modalidad;
    cuposMaximos: number;
    vigenciaDesde: Date;
    vigenciaHasta: Date;
    activa: boolean;
  }): DisponibilidadTutor {
    return new DisponibilidadTutor({
      id: props.id,
      tutorUserId: props.tutorUserId,
      franjaId: props.franjaId,
      franjaDiaSemana: props.franjaDiaSemana,
      materiaId: props.materiaId,
      salaId: props.salaId,
      modalidad: props.modalidad,
      cupos: Cupos.crear(props.cuposMaximos),
      vigencia: RangoVigencia.crear(props.vigenciaDesde, props.vigenciaHasta),
      activa: props.activa,
    });
  }

  /** Modifica la plantilla (solo si está activa). No afecta tutorías ya materializadas. */
  public editar(cambios: CambiosDisponibilidad): void {
    if (!this.props.activa) {
      throw new BusinessRuleViolation(
        'No se puede editar una disponibilidad inactiva.',
      );
    }
    const modalidad = cambios.modalidad ?? this.props.modalidad;
    const salaId =
      cambios.salaId !== undefined ? cambios.salaId : this.props.salaId;
    DisponibilidadTutor.validarCoherencia(modalidad, salaId);

    this.props.materiaId = cambios.materiaId ?? this.props.materiaId;
    this.props.salaId = salaId;
    this.props.modalidad = modalidad;
    if (cambios.cuposMaximos !== undefined) {
      this.props.cupos = Cupos.crear(cambios.cuposMaximos);
    }
    if (
      cambios.vigenciaDesde !== undefined ||
      cambios.vigenciaHasta !== undefined
    ) {
      this.props.vigencia = RangoVigencia.crear(
        cambios.vigenciaDesde ?? this.props.vigencia.desde,
        cambios.vigenciaHasta ?? this.props.vigencia.hasta,
      );
    }
  }

  public desactivar(): void {
    this.props.activa = false;
  }

  /**
   * Materializa una `Tutoria` PROGRAMADA para `fecha`. Valida que esté activa,
   * que la fecha caiga en la vigencia y que su ISODOW coincida con el día de la
   * franja. Devuelve el agregado `Tutoria` (no lo persiste).
   */
  public materializarEn(fecha: Date): Tutoria {
    if (!this.props.activa) {
      throw new BusinessRuleViolation(
        'No se puede materializar una disponibilidad inactiva.',
      );
    }
    if (!this.props.vigencia.contiene(fecha)) {
      throw new BusinessRuleViolation(
        'La fecha está fuera de la vigencia de la disponibilidad.',
      );
    }
    if (isoDow(fecha) !== this.props.franjaDiaSemana) {
      throw new ValidationError(
        `La fecha no corresponde al día de la franja (esperado ISODOW ${this.props.franjaDiaSemana}).`,
      );
    }
    return Tutoria.programar({
      tutorUserId: this.props.tutorUserId,
      franjaId: this.props.franjaId,
      fecha,
      materiaId: this.props.materiaId,
      salaId: this.props.salaId,
      modalidad: this.props.modalidad,
      cuposMaximos: this.props.cupos.maximos,
      disponibilidadId: this.props.id,
    });
  }

  private static validarCoherencia(
    modalidad: Modalidad,
    salaId: string | null,
  ): void {
    // La sala es opcional en ambas modalidades: una tutoría VIRTUAL puede
    // dictarse desde un salón físico. Solo PRESENCIAL exige sala.
    if (modalidad === Modalidad.PRESENCIAL && !salaId) {
      throw new ValidationError(
        'Una disponibilidad PRESENCIAL requiere una sala.',
      );
    }
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

  public get franjaDiaSemana(): number {
    return this.props.franjaDiaSemana;
  }

  public get materiaId(): string {
    return this.props.materiaId;
  }

  public get salaId(): string | null {
    return this.props.salaId;
  }

  public get modalidad(): Modalidad {
    return this.props.modalidad;
  }

  public get cuposMaximos(): number {
    return this.props.cupos.maximos;
  }

  public get vigencia(): RangoVigencia {
    return this.props.vigencia;
  }

  public get activa(): boolean {
    return this.props.activa;
  }
}

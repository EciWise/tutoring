import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { DiaSemana } from '../value-objects/dia-semana.vo';
import { RangoHorario } from '../value-objects/rango-horario.vo';

interface FranjaHorariaProps {
  id: string;
  diaSemana: DiaSemana;
  rango: RangoHorario;
  orden: number;
  activa: boolean;
  creadoEn: Date;
}

const MIN_ORDEN = 1;
const MAX_ORDEN = 8;

/**
 * Franja horaria de la grilla semanal (L-V × 8 bloques de 90 min). Compone los
 * VOs `DiaSemana` (rango L-V) y `RangoHorario` (duración exacta 90 min). El
 * `orden` (1..8) ubica el bloque dentro del día y es único por día en la BD.
 */
export class FranjaHoraria {
  private constructor(private readonly props: FranjaHorariaProps) {}

  public static crear(
    diaSemana: number,
    horaInicio: string,
    horaFin: string,
    orden: number,
  ): FranjaHoraria {
    return new FranjaHoraria({
      id: randomUUID(),
      diaSemana: DiaSemana.crear(diaSemana),
      rango: RangoHorario.crear(horaInicio, horaFin),
      orden: FranjaHoraria.validarOrden(orden),
      activa: true,
      creadoEn: new Date(),
    });
  }

  /** Rehidrata desde primitivos de persistencia; re-valida los invariantes. */
  public static reconstituir(props: {
    id: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    orden: number;
    activa: boolean;
    creadoEn: Date;
  }): FranjaHoraria {
    return new FranjaHoraria({
      id: props.id,
      diaSemana: DiaSemana.crear(props.diaSemana),
      rango: RangoHorario.crear(props.horaInicio, props.horaFin),
      orden: FranjaHoraria.validarOrden(props.orden),
      activa: props.activa,
      creadoEn: props.creadoEn,
    });
  }

  private static validarOrden(orden: number): number {
    if (!Number.isInteger(orden) || orden < MIN_ORDEN || orden > MAX_ORDEN) {
      throw new ValidationError(
        `El orden de la franja debe ser un entero entre ${MIN_ORDEN} y ${MAX_ORDEN}; se recibió: ${orden}`,
      );
    }
    return orden;
  }

  public get id(): string {
    return this.props.id;
  }

  public get diaSemana(): number {
    return this.props.diaSemana.valor;
  }

  public get horaInicio(): string {
    return this.props.rango.horaInicio;
  }

  public get horaFin(): string {
    return this.props.rango.horaFin;
  }

  public get orden(): number {
    return this.props.orden;
  }

  public get activa(): boolean {
    return this.props.activa;
  }

  public get creadoEn(): Date {
    return this.props.creadoEn;
  }
}

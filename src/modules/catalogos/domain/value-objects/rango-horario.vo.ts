import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';

interface RangoHorarioProps {
  inicioMinutos: number;
  finMinutos: number;
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Rango horario de una franja de tutoría. Toda franja dura EXACTAMENTE 90 min
 * (regla del negocio: 8 bloques de 90 min entre 07:00 y 19:00). La BD almacena
 * `hora_inicio`/`hora_fin` como `Time` sin CHECK; este VO es la única garantía
 * de la duración. Las horas se manejan como minutos desde medianoche.
 */
export class RangoHorario extends ValueObject<RangoHorarioProps> {
  public static readonly DURACION_MIN = 90;

  private constructor(props: RangoHorarioProps) {
    super(props);
  }

  public static crear(horaInicio: string, horaFin: string): RangoHorario {
    const inicioMinutos = RangoHorario.aMinutos(horaInicio);
    const finMinutos = RangoHorario.aMinutos(horaFin);

    if (finMinutos - inicioMinutos !== RangoHorario.DURACION_MIN) {
      throw new ValidationError(
        `La franja debe durar exactamente ${RangoHorario.DURACION_MIN} minutos; ${horaInicio}–${horaFin} dura ${finMinutos - inicioMinutos}.`,
      );
    }
    return new RangoHorario({ inicioMinutos, finMinutos });
  }

  private static aMinutos(hora: string): number {
    const match = HHMM.exec(hora);
    if (!match) {
      throw new ValidationError(
        `Hora inválida: "${hora}". Formato esperado HH:MM (24h).`,
      );
    }
    return Number(match[1]) * 60 + Number(match[2]);
  }

  private static aHora(minutos: number): string {
    const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
    const mm = String(minutos % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  public get horaInicio(): string {
    return RangoHorario.aHora(this.props.inicioMinutos);
  }

  public get horaFin(): string {
    return RangoHorario.aHora(this.props.finMinutos);
  }
}

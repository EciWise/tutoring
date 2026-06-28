import { ValidationError } from '../errors/domain-error';
import { ValueObject } from './value-object.base';

interface CalificacionProps {
  valor: number;
}

/**
 * Calificación 1-5 (entero). Usada tanto por evaluaciones de tutoría (RF-13)
 * como de participación (RF-22). La validez del rango es una invariante de
 * dominio: la BD almacena `SmallInt` sin CHECK, por lo que este VO es la única
 * garantía. Ver RN-06/RN-07.
 */
export class Calificacion extends ValueObject<CalificacionProps> {
  private static readonly MIN = 1;
  private static readonly MAX = 5;

  private constructor(props: CalificacionProps) {
    super(props);
  }

  public static crear(valor: number): Calificacion {
    if (!Number.isInteger(valor)) {
      throw new ValidationError(
        `La calificación debe ser un entero; se recibió: ${valor}`,
      );
    }
    if (valor < Calificacion.MIN || valor > Calificacion.MAX) {
      throw new ValidationError(
        `La calificación debe estar entre ${Calificacion.MIN} y ${Calificacion.MAX}; se recibió: ${valor}`,
      );
    }
    return new Calificacion({ valor });
  }

  public get valor(): number {
    return this.props.valor;
  }
}

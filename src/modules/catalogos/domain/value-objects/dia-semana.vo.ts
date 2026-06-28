import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';

interface DiaSemanaProps {
  valor: number;
}

/**
 * Día hábil de la semana en ISODOW (1=Lunes ... 5=Viernes). El negocio solo
 * ofrece tutorías de lunes a viernes; sábado/domingo (6/7) quedan fuera del
 * rango por diseño. La BD guarda un `SmallInt` sin CHECK, así que este VO es la
 * única garantía del rango.
 */
export class DiaSemana extends ValueObject<DiaSemanaProps> {
  private static readonly MIN = 1;
  private static readonly MAX = 5;

  private constructor(props: DiaSemanaProps) {
    super(props);
  }

  public static crear(valor: number): DiaSemana {
    if (!Number.isInteger(valor)) {
      throw new ValidationError(
        `El día de la semana debe ser un entero; se recibió: ${valor}`,
      );
    }
    if (valor < DiaSemana.MIN || valor > DiaSemana.MAX) {
      throw new ValidationError(
        `El día de la semana debe estar entre ${DiaSemana.MIN} (lunes) y ${DiaSemana.MAX} (viernes); se recibió: ${valor}`,
      );
    }
    return new DiaSemana({ valor });
  }

  public get valor(): number {
    return this.props.valor;
  }
}

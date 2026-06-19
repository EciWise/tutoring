import { ValidationError } from '../errors/domain-error';
import { ValueObject } from './value-object.base';

interface CuposProps {
  maximos: number;
  ocupados: number;
}

/**
 * Cupos de una tutoría/disponibilidad: `maximos` ≥ 1 y `ocupados` ∈ [0, maximos]
 * (RN-09/RF-21). La BD no tiene CHECK; este VO es la única garantía del rango.
 * Una disponibilidad usa solo `maximos` (ocupados = 0); una `Tutoria` los usa
 * ambos para controlar la capacidad.
 */
export class Cupos extends ValueObject<CuposProps> {
  private constructor(props: CuposProps) {
    super(props);
  }

  public static crear(maximos: number, ocupados = 0): Cupos {
    if (!Number.isInteger(maximos) || maximos < 1) {
      throw new ValidationError(
        `Los cupos máximos deben ser un entero ≥ 1; se recibió: ${maximos}`,
      );
    }
    if (!Number.isInteger(ocupados) || ocupados < 0 || ocupados > maximos) {
      throw new ValidationError(
        `Los cupos ocupados deben estar entre 0 y ${maximos}; se recibió: ${ocupados}`,
      );
    }
    return new Cupos({ maximos, ocupados });
  }

  public hayCupo(): boolean {
    return this.props.ocupados < this.props.maximos;
  }

  public get maximos(): number {
    return this.props.maximos;
  }

  public get ocupados(): number {
    return this.props.ocupados;
  }
}

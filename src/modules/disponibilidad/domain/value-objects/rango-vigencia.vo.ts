import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';
import { aUTCDate } from '../fecha.util';

interface RangoVigenciaProps {
  desde: Date;
  hasta: Date;
}

/**
 * Rango de vigencia de una plantilla de disponibilidad (`vigenciaDesde`/`Hasta`,
 * `@db.Date`). Invariante: `hasta >= desde`. Las fechas se normalizan a medianoche
 * UTC para comparar por día sin desfases de zona horaria.
 */
export class RangoVigencia extends ValueObject<RangoVigenciaProps> {
  private constructor(props: RangoVigenciaProps) {
    super(props);
  }

  public static crear(desde: Date, hasta: Date): RangoVigencia {
    const d = aUTCDate(desde);
    const h = aUTCDate(hasta);
    if (h.getTime() < d.getTime()) {
      throw new ValidationError(
        'La vigencia hasta debe ser mayor o igual que la vigencia desde.',
      );
    }
    return new RangoVigencia({ desde: d, hasta: h });
  }

  /** ¿La fecha cae dentro del rango (inclusive)? */
  public contiene(fecha: Date): boolean {
    const f = aUTCDate(fecha).getTime();
    return f >= this.props.desde.getTime() && f <= this.props.hasta.getTime();
  }

  public get desde(): Date {
    return this.props.desde;
  }

  public get hasta(): Date {
    return this.props.hasta;
  }
}

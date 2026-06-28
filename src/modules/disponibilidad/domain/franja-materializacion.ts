import { addDays, aUTCDate, isoDow } from './fecha.util';
import { RangoVigencia } from './value-objects/rango-vigencia.vo';

/**
 * Fechas dentro de la ventana móvil en las que una disponibilidad debe
 * materializarse: las que caen en el `diaSemana` (ISODOW) de la franja Y dentro
 * de la vigencia. Función pura — única fuente de verdad del cálculo, testeada.
 */
export function calcularFechasMaterializables(
  diaSemana: number,
  vigencia: RangoVigencia,
  ventanaDesde: Date,
  ventanaHasta: Date,
): Date[] {
  const fin = aUTCDate(ventanaHasta).getTime();
  const fechas: Date[] = [];
  let cursor = aUTCDate(ventanaDesde);
  while (cursor.getTime() <= fin) {
    if (isoDow(cursor) === diaSemana && vigencia.contiene(cursor)) {
      fechas.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }
  return fechas;
}

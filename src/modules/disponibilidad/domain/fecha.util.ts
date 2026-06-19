/**
 * Utilidades de fecha en UTC (las columnas son `@db.Date`, sin hora). Se trabaja
 * siempre normalizando a medianoche UTC para evitar desfases por zona horaria.
 */

/** Normaliza a medianoche UTC (descarta hora/min/seg). */
export function aUTCDate(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** Devuelve una nueva fecha desplazada `n` días (en UTC). */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

/** Día de la semana ISO (1=Lunes ... 7=Domingo). */
export function isoDow(d: Date): number {
  const dow = aUTCDate(d).getUTCDay(); // 0=Dom ... 6=Sáb
  return dow === 0 ? 7 : dow;
}

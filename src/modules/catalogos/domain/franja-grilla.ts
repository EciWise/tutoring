/**
 * Grilla semanal de franjas horarias del negocio: lunes a viernes (ISODOW 1-5),
 * 8 bloques de 90 min entre las 07:00 y las 19:00
 * (07:00–08:30, 08:30–10:00, ..., 17:30–19:00).
 *
 * Función pura y única fuente de verdad de la grilla: la reutiliza el seed
 * (`prisma/seed.ts`) para sembrar `franja_horaria`. Sin esta grilla sembrada no
 * se puede declarar ninguna disponibilidad.
 */
export interface FranjaGrillaItem {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  orden: number;
}

const DIAS_HABILES = [1, 2, 3, 4, 5];
const BLOQUES_POR_DIA = 8;
const DURACION_MIN = 90;
const INICIO_JORNADA_MIN = 7 * 60; // 07:00

function aHora(minutos: number): string {
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mm = String(minutos % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function construirGrillaFranjas(): FranjaGrillaItem[] {
  const grilla: FranjaGrillaItem[] = [];
  for (const diaSemana of DIAS_HABILES) {
    for (let bloque = 0; bloque < BLOQUES_POR_DIA; bloque++) {
      const inicio = INICIO_JORNADA_MIN + bloque * DURACION_MIN;
      grilla.push({
        diaSemana,
        horaInicio: aHora(inicio),
        horaFin: aHora(inicio + DURACION_MIN),
        orden: bloque + 1,
      });
    }
  }
  return grilla;
}

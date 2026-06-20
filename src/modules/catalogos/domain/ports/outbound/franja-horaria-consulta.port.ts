/** Token de inyección del puerto público de consulta de franjas. */
export const FRANJA_HORARIA_CONSULTA = Symbol('FRANJA_HORARIA_CONSULTA');

/** Vista mínima de una franja para consumo cross-slice. */
export interface FranjaConsultaView {
  id: string;
  diaSemana: number;
  activa: boolean;
}

/**
 * Puerto **público** de `catalogos` para resolver una franja por id (su día y
 * estado), sin exponer la entidad de dominio ni el repositorio interno. Lo usa
 * `disponibilidad` para fijar el `diaSemana` de la plantilla al publicar.
 */
export interface IFranjaHorariaConsultaPort {
  obtenerPorId(id: string): Promise<FranjaConsultaView | null>;
}

/**
 * Base de los eventos de dominio. Los slices `reservas`, `asistencia` y
 * `evaluaciones` los emiten desde el día uno vía `IEventPublisher`, aunque
 * `reputacion` (consumidor) se implemente al final. Migrar a RabbitMQ solo
 * cambia el adapter del publisher, no estos eventos.
 */
export abstract class DomainEvent {
  /** Identificador del agregado que originó el evento. */
  public readonly aggregateId: string;
  /** Marca temporal de ocurrencia (UTC). */
  public readonly ocurridoEn: Date;

  protected constructor(aggregateId: string, ocurridoEn?: Date) {
    this.aggregateId = aggregateId;
    this.ocurridoEn = ocurridoEn ?? new Date();
  }

  /**
   * Nombre estable del evento para enrutamiento/publicación
   * (p.ej. `tutoria.realizada`, `evaluacion.registrada`).
   */
  public abstract get nombre(): string;
}

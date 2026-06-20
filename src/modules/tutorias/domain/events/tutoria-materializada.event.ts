import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

/**
 * Emitido cuando el job de materialización crea una `Tutoria` PROGRAMADA a partir
 * de una disponibilidad. Aún sin consumidores (reputación llega después), pero se
 * publica desde el día uno para no reabrir el slice luego (CLAUDE.md §10).
 */
export class TutoriaMaterializada extends DomainEvent {
  constructor(
    public readonly tutoriaId: string,
    public readonly tutorUserId: string,
    public readonly disponibilidadId: string | null,
    public readonly fecha: Date,
  ) {
    super(tutoriaId);
  }

  public get nombre(): string {
    return 'tutoria.materializada';
  }
}

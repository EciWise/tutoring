import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

/** Emitido al publicar una nueva plantilla de disponibilidad (RF-01). */
export class DisponibilidadPublicada extends DomainEvent {
  constructor(
    public readonly disponibilidadId: string,
    public readonly tutorUserId: string,
    public readonly franjaId: string,
    public readonly materiaId: string,
  ) {
    super(disponibilidadId);
  }

  public get nombre(): string {
    return 'disponibilidad.publicada';
  }
}

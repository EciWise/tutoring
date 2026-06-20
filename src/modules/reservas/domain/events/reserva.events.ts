import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

/** El estudiante reservó un cupo en una tutoría (RF-05). aggregateId = tutoriaId. */
export class TutoriaReservada extends DomainEvent {
  constructor(
    public readonly tutoriaId: string,
    public readonly participanteId: string,
    public readonly estudianteUserId: string,
  ) {
    super(tutoriaId);
  }

  public get nombre(): string {
    return 'tutoria.reservada';
  }
}

/** El estudiante canceló su participación (RF-06); se liberó el cupo. */
export class ReservaCancelada extends DomainEvent {
  constructor(
    public readonly tutoriaId: string,
    public readonly participanteId: string,
    public readonly estudianteUserId: string,
    public readonly motivo: string,
  ) {
    super(tutoriaId);
  }

  public get nombre(): string {
    return 'reserva.cancelada';
  }
}

/** El tutor canceló la tutoría completa (RF-07); se liberó a todos los participantes. */
export class TutoriaCanceladaPorTutor extends DomainEvent {
  constructor(
    public readonly tutoriaId: string,
    public readonly tutorUserId: string,
    public readonly motivo: string,
    public readonly participantesLiberados: number,
  ) {
    super(tutoriaId);
  }

  public get nombre(): string {
    return 'tutoria.cancelada-por-tutor';
  }
}

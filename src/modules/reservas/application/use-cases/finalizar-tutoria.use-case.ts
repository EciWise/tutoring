import { Inject, Injectable } from '@nestjs/common';
import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import {
  BusinessRuleViolation,
  NotFoundError,
} from '../../../../shared/domain/errors/domain-error';
import {
  EVENT_PUBLISHER,
  type IEventPublisher,
} from '../../../../shared/domain/events/event-publisher.port';
import { TutoriaRealizada } from '../../domain/events/reserva.events';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../domain/ports/outbound/reserva.repository.port';

export interface ResultadoFinalizacionTutoria {
  tutoriaId: string;
  participantes: number;
}

/**
 * El tutor (o un admin) marca la tutoría como REALIZADA una vez dictada. Valida
 * la titularidad y el estado PROGRAMADO, persiste el cambio y emite
 * `TutoriaRealizada` para que gamificación asigne puntos al tutor y a los
 * participantes que asistieron.
 */
@Injectable()
export class FinalizarTutoriaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    tutoriaId: string;
    actor: { userId: string; esAdmin: boolean };
  }): Promise<ResultadoFinalizacionTutoria> {
    const tutoria = await this.repo.buscarTutoriaParaReserva(input.tutoriaId);
    if (!tutoria) {
      throw new NotFoundError(`No existe la tutoría: ${input.tutoriaId}`);
    }
    if (!input.actor.esAdmin && tutoria.tutorUserId !== input.actor.userId) {
      throw new BusinessRuleViolation(
        'No puede finalizar una tutoría de otro tutor.',
      );
    }
    if (tutoria.estado !== EstadoTutoria.PROGRAMADA) {
      throw new BusinessRuleViolation(
        'Solo se puede finalizar una tutoría PROGRAMADA.',
      );
    }

    const participantesUserIds = await this.repo.finalizarTutoria(
      input.tutoriaId,
    );
    await this.eventos.publish(
      new TutoriaRealizada(
        input.tutoriaId,
        tutoria.tutorUserId,
        participantesUserIds,
      ),
    );
    return {
      tutoriaId: input.tutoriaId,
      participantes: participantesUserIds.length,
    };
  }
}

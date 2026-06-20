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
import { TutoriaCanceladaPorTutor } from '../../domain/events/reserva.events';
import { exigirMotivo } from '../../domain/motivo';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../domain/ports/outbound/reserva.repository.port';

export interface ResultadoCancelacionTutoria {
  tutoriaId: string;
  participantesLiberados: number;
}

/**
 * RF-07: el tutor (o un admin) cancela la tutoría completa aunque tenga reservas.
 * Exige motivo (RN-08), libera a todos los participantes y emite el evento.
 */
@Injectable()
export class CancelarTutoriaPorTutorUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    tutoriaId: string;
    actor: { userId: string; esAdmin: boolean };
    motivo: string;
  }): Promise<ResultadoCancelacionTutoria> {
    const tutoria = await this.repo.buscarTutoriaParaReserva(input.tutoriaId);
    if (!tutoria) {
      throw new NotFoundError(`No existe la tutoría: ${input.tutoriaId}`);
    }
    if (!input.actor.esAdmin && tutoria.tutorUserId !== input.actor.userId) {
      throw new BusinessRuleViolation(
        'No puede cancelar una tutoría de otro tutor.',
      );
    }
    if (tutoria.estado !== EstadoTutoria.PROGRAMADA) {
      throw new BusinessRuleViolation(
        'Solo se puede cancelar una tutoría PROGRAMADA.',
      );
    }

    const motivo = exigirMotivo(input.motivo);
    const liberados = await this.repo.cancelarTutoria(input.tutoriaId, motivo);
    await this.eventos.publish(
      new TutoriaCanceladaPorTutor(
        input.tutoriaId,
        tutoria.tutorUserId,
        motivo,
        liberados,
      ),
    );
    return { tutoriaId: input.tutoriaId, participantesLiberados: liberados };
  }
}

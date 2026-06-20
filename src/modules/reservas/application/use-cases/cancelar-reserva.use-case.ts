import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import {
  EVENT_PUBLISHER,
  type IEventPublisher,
} from '../../../../shared/domain/events/event-publisher.port';
import { Participante } from '../../domain/entities/participante.entity';
import { ReservaCancelada } from '../../domain/events/reserva.events';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../domain/ports/outbound/reserva.repository.port';

/** RF-06: el estudiante cancela su participación (exige motivo) y libera el cupo. */
@Injectable()
export class CancelarReservaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    tutoriaId: string;
    estudianteUserId: string;
    motivo: string;
  }): Promise<Participante> {
    const participante = await this.repo.obtenerParticipanteActivo(
      input.tutoriaId,
      input.estudianteUserId,
    );
    if (!participante) {
      throw new NotFoundError('No tienes una reserva activa en esa tutoría.');
    }
    participante.cancelar(input.motivo);
    await this.repo.cancelarReserva(participante);
    await this.eventos.publish(
      new ReservaCancelada(
        input.tutoriaId,
        participante.id,
        input.estudianteUserId,
        participante.motivoCancelacion ?? input.motivo,
      ),
    );
    return participante;
  }
}

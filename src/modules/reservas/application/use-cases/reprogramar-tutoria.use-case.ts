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
import { Participante } from '../../domain/entities/participante.entity';
import {
  ReservaCancelada,
  TutoriaReservada,
} from '../../domain/events/reserva.events';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../domain/ports/outbound/reserva.repository.port';

/**
 * RF-08: reprograma = cancelar en origen + reservar en destino, en una sola
 * transacción atómica (todo-o-nada). Si el destino está lleno, el origen queda
 * intacto. Sin traza histórica (decisión de alcance D-4).
 */
@Injectable()
export class ReprogramarTutoriaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    estudianteUserId: string;
    tutoriaOrigenId: string;
    tutoriaDestinoId: string;
    motivo: string;
    temaEspecifico?: string | null;
    descripcionDudas?: string | null;
  }): Promise<{ origen: Participante; destino: Participante }> {
    if (input.tutoriaOrigenId === input.tutoriaDestinoId) {
      throw new BusinessRuleViolation(
        'La tutoría origen y destino deben ser distintas.',
      );
    }

    const origen = await this.repo.obtenerParticipanteActivo(
      input.tutoriaOrigenId,
      input.estudianteUserId,
    );
    if (!origen) {
      throw new NotFoundError(
        'No tienes una reserva activa en la tutoría origen.',
      );
    }

    const destino = await this.repo.buscarTutoriaParaReserva(
      input.tutoriaDestinoId,
    );
    if (!destino) {
      throw new NotFoundError(
        `No existe la tutoría destino: ${input.tutoriaDestinoId}`,
      );
    }
    if (destino.estado !== EstadoTutoria.PROGRAMADA) {
      throw new BusinessRuleViolation('La tutoría destino no está disponible.');
    }

    // RN-01 sobre el destino, excluyendo el origen (que se cancela en la misma tx).
    const traslape = await this.repo.estudianteTieneTraslape(
      input.estudianteUserId,
      destino.fecha,
      destino.franjaId,
      input.tutoriaOrigenId,
    );
    if (traslape) {
      throw new BusinessRuleViolation(
        'La tutoría destino se traslapa con otra reserva tuya (RN-01).',
      );
    }

    origen.cancelar(input.motivo);
    const motivo = origen.motivoCancelacion ?? input.motivo;
    const nuevoDestino = Participante.reservar({
      tutoriaId: input.tutoriaDestinoId,
      estudianteUserId: input.estudianteUserId,
      temaEspecifico: input.temaEspecifico,
      descripcionDudas: input.descripcionDudas,
    });

    await this.repo.reprogramar(
      {
        tutoriaId: input.tutoriaOrigenId,
        estudianteUserId: input.estudianteUserId,
        motivo,
      },
      nuevoDestino,
    );

    await this.eventos.publishAll([
      new ReservaCancelada(
        input.tutoriaOrigenId,
        origen.id,
        input.estudianteUserId,
        motivo,
      ),
      new TutoriaReservada(
        input.tutoriaDestinoId,
        nuevoDestino.id,
        input.estudianteUserId,
      ),
    ]);
    return { origen, destino: nuevoDestino };
  }
}

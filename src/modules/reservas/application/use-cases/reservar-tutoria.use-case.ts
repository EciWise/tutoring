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
import { TutoriaReservada } from '../../domain/events/reserva.events';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../domain/ports/outbound/reserva.repository.port';

/**
 * RF-05: el estudiante reserva un cupo. RN-04 = JWT válido (rol estudiante en el
 * controller); RN-01 = sin traslapes (fecha+franja); RN-09 + no doble inscripción
 * = UPDATE atómico de cupo + unicidad, en el repositorio (lanza `ConflictError`).
 */
@Injectable()
export class ReservarTutoriaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    tutoriaId: string;
    estudianteUserId: string;
    temaEspecifico?: string | null;
    descripcionDudas?: string | null;
  }): Promise<Participante> {
    const tutoria = await this.repo.buscarTutoriaParaReserva(input.tutoriaId);
    if (!tutoria) {
      throw new NotFoundError(`No existe la tutoría: ${input.tutoriaId}`);
    }
    if (tutoria.estado !== EstadoTutoria.PROGRAMADA) {
      throw new BusinessRuleViolation(
        'La tutoría no está disponible para reservar.',
      );
    }

    const traslape = await this.repo.estudianteTieneTraslape(
      input.estudianteUserId,
      tutoria.fecha,
      tutoria.franjaId,
    );
    if (traslape) {
      throw new BusinessRuleViolation(
        'Ya tienes una tutoría reservada en esa fecha y franja (RN-01).',
      );
    }

    const participante = Participante.reservar(input);
    await this.repo.reservar(participante);
    await this.eventos.publish(
      new TutoriaReservada(
        tutoria.id,
        participante.id,
        participante.estudianteUserId,
      ),
    );
    return participante;
  }
}

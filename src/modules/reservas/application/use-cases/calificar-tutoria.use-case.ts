import { Inject, Injectable } from '@nestjs/common';
import { Calificacion } from '../../../../shared/domain/value-objects/calificacion.vo';
import {
  EVENT_PUBLISHER,
  type IEventPublisher,
} from '../../../../shared/domain/events/event-publisher.port';
import { TutoriaCalificada } from '../../domain/events/reserva.events';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../domain/ports/outbound/reserva.repository.port';

export interface ResultadoCalificacion {
  tutoriaId: string;
  calificacion: number;
}

/**
 * RF-13: el estudiante califica (1-5) a su tutor tras una tutoría REALIZADA. El
 * rango se valida con el VO `Calificacion`; la unicidad por participante (RN-07)
 * la garantiza el repositorio. Emite `TutoriaCalificada` para gamificación.
 */
@Injectable()
export class CalificarTutoriaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly repo: IReservaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    tutoriaId: string;
    estudianteUserId: string;
    calificacion: number;
    comentario?: string | null;
  }): Promise<ResultadoCalificacion> {
    const calificacion = Calificacion.crear(input.calificacion);

    const { tutorUserId } = await this.repo.calificarTutoria({
      tutoriaId: input.tutoriaId,
      estudianteUserId: input.estudianteUserId,
      calificacion: calificacion.valor,
      comentario: input.comentario ?? null,
    });

    await this.eventos.publish(
      new TutoriaCalificada(
        input.tutoriaId,
        tutorUserId,
        input.estudianteUserId,
        calificacion.valor,
      ),
    );

    return { tutoriaId: input.tutoriaId, calificacion: calificacion.valor };
  }
}

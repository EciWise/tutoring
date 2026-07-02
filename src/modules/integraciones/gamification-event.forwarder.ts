import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import { RabbitMqService } from '../../shared/infrastructure/messaging/rabbitmq.service';
import {
  EXCHANGE_EVENTS,
  RK_TUTORIA_CALIFICADA,
  RK_TUTORIA_DICTADA,
  RK_TUTORIA_REALIZADA,
} from '../../shared/infrastructure/messaging/rabbitmq.constants';
import {
  TutoriaCalificada,
  TutoriaRealizada,
} from '../reservas/domain/events/reserva.events';

/**
 * Puente in-process → RabbitMQ que reenvía los eventos de dominio que premia
 * gamificación. Una tutoría REALIZADA genera un mensaje por destinatario (el
 * tutor por dictarla y cada participante por asistir), cada uno con su propio
 * `eventId` (clave de idempotencia distinta) y el `userId` correspondiente. El
 * sobre es compatible con el consumidor .NET (`eventType`, `eventId`, `userId`).
 */
@Injectable()
export class GamificationEventForwarder {
  private readonly logger = new Logger(GamificationEventForwarder.name);

  constructor(private readonly rabbit: RabbitMqService) {}

  @OnEvent('tutoria.realizada')
  handleTutoriaRealizada(event: TutoriaRealizada): void {
    const occurredOn = event.ocurridoEn.toISOString();

    // El tutor recibe puntos por dictar la tutoría.
    this.publish(RK_TUTORIA_DICTADA, {
      eventId: randomUUID(),
      eventType: RK_TUTORIA_DICTADA,
      occurredOn,
      userId: event.tutorUserId,
      tutoriaId: event.tutoriaId,
    });

    // Cada participante recibe puntos por completar la tutoría.
    for (const estudianteUserId of event.participantesUserIds) {
      this.publish(RK_TUTORIA_REALIZADA, {
        eventId: randomUUID(),
        eventType: RK_TUTORIA_REALIZADA,
        occurredOn,
        userId: estudianteUserId,
        tutoriaId: event.tutoriaId,
      });
    }
  }

  @OnEvent('tutoria.calificada')
  handleTutoriaCalificada(event: TutoriaCalificada): void {
    // El tutor recibe puntos por ser calificado.
    this.publish(RK_TUTORIA_CALIFICADA, {
      eventId: randomUUID(),
      eventType: RK_TUTORIA_CALIFICADA,
      occurredOn: event.ocurridoEn.toISOString(),
      userId: event.tutorUserId,
      tutoriaId: event.tutoriaId,
      calificacion: event.calificacion,
    });
  }

  private publish(routingKey: string, payload: Record<string, unknown>): void {
    const ok = this.rabbit.publish(EXCHANGE_EVENTS, routingKey, payload);
    if (ok) {
      this.logger.debug(
        `Evento "${routingKey}" reenviado a gamificación (userId=${String(payload.userId)}).`,
      );
    }
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RabbitMqService } from '../../shared/infrastructure/messaging/rabbitmq.service';
import {
  EXCHANGE_NOTIFICATIONS,
  RK_NOTIFICATION_INDIVIDUAL,
} from '../../shared/infrastructure/messaging/rabbitmq.constants';
import {
  USUARIO_DIRECTORY_PORT,
  type IUsuarioDirectoryPort,
} from '../identidad/domain/ports/outbound/usuario-directory.port';
import {
  ReservaCancelada,
  TutoriaCanceladaPorTutor,
  TutoriaRealizada,
  TutoriaReservada,
} from '../reservas/domain/events/reserva.events';

/**
 * Puente in-process → RabbitMQ hacia el servicio `notifications`. Por cada
 * evento de tutoría resuelve el email del destinatario en el espejo local de
 * `identidad` y publica un sobre `individual` al exchange `notifications`. Si el
 * email aún no está capturado (espejo perezoso desde el JWT), se omite con log.
 */
@Injectable()
export class TutoringNotificationsListener {
  private readonly logger = new Logger(TutoringNotificationsListener.name);

  constructor(
    @Inject(USUARIO_DIRECTORY_PORT)
    private readonly directorio: IUsuarioDirectoryPort,
    private readonly rabbit: RabbitMqService,
  ) {}

  @OnEvent('tutoria.reservada')
  async onReservada(event: TutoriaReservada): Promise<void> {
    await this.notificar(event.estudianteUserId, {
      template: 'ConfirmacionTutoriaEstudiante',
      resumen: 'Tu reserva de tutoría fue confirmada.',
      type: 'success',
    });
  }

  @OnEvent('reserva.cancelada')
  async onReservaCancelada(event: ReservaCancelada): Promise<void> {
    await this.notificar(event.estudianteUserId, {
      template: 'CancelacionTutoriaEstudiante',
      resumen: `Cancelaste tu reserva de tutoría. Motivo: ${event.motivo}`,
      type: 'info',
    });
  }

  @OnEvent('tutoria.cancelada-por-tutor')
  async onCanceladaPorTutor(event: TutoriaCanceladaPorTutor): Promise<void> {
    await this.notificar(event.tutorUserId, {
      template: 'CancelacionTutoriaTutor',
      resumen: `Cancelaste la tutoría y se liberaron ${event.participantesLiberados} participante(s).`,
      type: 'info',
    });
  }

  @OnEvent('tutoria.realizada')
  async onRealizada(event: TutoriaRealizada): Promise<void> {
    await this.notificar(event.tutorUserId, {
      template: 'CompletacionTutoriaTutor',
      resumen: 'Marcaste la tutoría como realizada.',
      type: 'success',
    });
    for (const estudianteUserId of event.participantesUserIds) {
      await this.notificar(estudianteUserId, {
        template: 'CompletacionTutoriaEstudiante',
        resumen: 'Tu tutoría fue completada. ¡Gracias por asistir!',
        type: 'success',
      });
    }
  }

  private async notificar(
    userId: string,
    payload: { template: string; resumen: string; type: string },
  ): Promise<void> {
    const usuario = await this.directorio.getById(userId);
    if (!usuario?.email) {
      this.logger.warn(
        `Sin email para userId=${userId}; notificación "${payload.template}" omitida.`,
      );
      return;
    }
    this.rabbit.publish(EXCHANGE_NOTIFICATIONS, RK_NOTIFICATION_INDIVIDUAL, {
      eventType: 'notification',
      notificationType: 'individual',
      language: 'es',
      data: {
        email: usuario.email,
        name: `${usuario.nombre} ${usuario.apellido}`,
        template: payload.template,
        resumen: payload.resumen,
        type: payload.type,
        mandarCorreo: true,
        guardar: true,
      },
    });
  }
}

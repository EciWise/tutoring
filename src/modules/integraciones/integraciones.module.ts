import { Module } from '@nestjs/common';
import { IdentidadModule } from '../identidad/identidad.module';
import { GamificationEventForwarder } from './gamification-event.forwarder';
import { TutoringNotificationsListener } from './tutoring-notifications.listener';

/**
 * Slice de integración saliente: escucha eventos de dominio in-process
 * (`EventEmitter2`) y los reenvía a RabbitMQ hacia gamificación y notificaciones.
 * No expone HTTP; solo registra listeners. `RabbitMqService` llega del módulo
 * global `RabbitMqModule`.
 */
@Module({
  imports: [IdentidadModule],
  providers: [GamificationEventForwarder, TutoringNotificationsListener],
})
export class IntegracionesModule {}

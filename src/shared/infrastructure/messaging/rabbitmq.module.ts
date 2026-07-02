import { Global, Module } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';

/**
 * Expone globalmente el `RabbitMqService` (publisher) para que los puentes de
 * integración (gamificación, notificaciones) reenvíen eventos de dominio al
 * broker. Requiere `ConfigModule` global (registrado en `AppModule`).
 */
@Global()
@Module({
  providers: [RabbitMqService],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}

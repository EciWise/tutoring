import { Global, Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from '../../domain/events/event-publisher.port';
import { InMemoryEventPublisher } from './in-memory-event-publisher';

/**
 * Liga el token `EVENT_PUBLISHER` a su implementación actual y lo expone de
 * forma global. Requiere `EventEmitterModule.forRoot()` (registrado en
 * `AppModule`) para resolver `EventEmitter2`.
 */
@Global()
@Module({
  providers: [{ provide: EVENT_PUBLISHER, useClass: InMemoryEventPublisher }],
  exports: [EVENT_PUBLISHER],
})
export class EventPublisherModule {}

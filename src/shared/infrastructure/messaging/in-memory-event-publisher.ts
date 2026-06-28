import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '../../domain/events/domain-event.base';
import { IEventPublisher } from '../../domain/events/event-publisher.port';

/**
 * Implementación inicial del puerto `IEventPublisher` sobre `EventEmitter2`
 * (in-process). Los consumidores se suscriben con `@OnEvent(event.nombre)`.
 * Migrar a RabbitMQ implica solo sustituir este adapter.
 */
@Injectable()
export class InMemoryEventPublisher implements IEventPublisher {
  private readonly logger = new Logger(InMemoryEventPublisher.name);

  constructor(private readonly emitter: EventEmitter2) {}

  publish(event: DomainEvent): Promise<void> {
    this.logger.debug(
      `Publicando ${event.nombre} (aggregateId=${event.aggregateId})`,
    );
    this.emitter.emit(event.nombre, event);
    return Promise.resolve();
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

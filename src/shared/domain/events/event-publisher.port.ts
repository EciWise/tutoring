import { DomainEvent } from './domain-event.base';

/** Token de inyección del puerto de publicación de eventos. */
export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

/**
 * Puerto de salida para publicar eventos de dominio. Definido en el dominio;
 * la infraestructura provee el adapter (in-memory hoy, RabbitMQ después).
 */
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

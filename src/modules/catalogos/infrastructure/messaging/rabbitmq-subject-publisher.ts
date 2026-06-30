import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, ChannelModel, Channel } from 'amqplib';
import {
  ISubjectEventPublisher,
  SubjectEventPayload,
} from '../../domain/ports/outbound/subject-event-publisher.port';

const SUBJECT_EVENTS_EXCHANGE = 'subject.events';

/**
 * Adaptador RabbitMQ que publica eventos de materias en el exchange `subject.events`
 * (tipo topic). Community consume estos eventos para mantener su copia local de `materia`.
 *
 * Si RabbitMQ no está disponible, los eventos se descartan con un warning — la
 * sincronización se recupera en la próxima operación que llame al publisher.
 */
@Injectable()
export class RabbitMQSubjectPublisher
  implements ISubjectEventPublisher, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMQSubjectPublisher.name);
  private connection?: ChannelModel;
  private channel?: Channel;
  private shuttingDown = false;
  private reconnectTimer?: NodeJS.Timeout;

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.shuttingDown = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    try { await this.connection?.close(); } catch { }
  }

  private async connect(): Promise<void> {
    const rabbitmqUrl = process.env.RABBITMQ_URL;
    if (!rabbitmqUrl) {
      this.logger.warn('RABBITMQ_URL no configurado — publicación de eventos de materias desactivada');
      return;
    }

    try {
      const connection = await connect(rabbitmqUrl);
      this.connection = connection;
      connection.on('error', (err: Error) => this.logger.error(`RabbitMQ error: ${err.message}`));
      connection.on('close', () => this.scheduleReconnect());

      this.channel = await connection.createChannel();
      await this.channel.assertExchange(SUBJECT_EVENTS_EXCHANGE, 'topic', { durable: true });

      this.logger.log('Conectado a RabbitMQ — publicando en subject.events');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`No se pudo conectar a RabbitMQ: ${msg}`);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.shuttingDown || this.reconnectTimer || !process.env.RABBITMQ_URL) return;
    this.channel = undefined;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.connect();
    }, 5000);
  }

  private publish(routingKey: string, payload: object): void {
    if (!this.channel) {
      this.logger.warn(`Sin conexión RabbitMQ — evento "${routingKey}" descartado`);
      return;
    }
    try {
      this.channel.publish(
        SUBJECT_EVENTS_EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true, contentType: 'application/json' },
      );
      this.logger.debug(`Evento publicado: ${routingKey}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error publicando ${routingKey}: ${msg}`);
    }
  }

  publishCreated(payload: SubjectEventPayload): void {
    this.publish('subject.created', payload);
  }

  publishUpdated(payload: SubjectEventPayload): void {
    this.publish('subject.updated', payload);
  }

  publishDeleted(id: string): void {
    this.publish('subject.deleted', { id });
  }
}

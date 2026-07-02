import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, ChannelModel } from 'amqplib';
import {
  EXCHANGE_EVENTS,
  EXCHANGE_NOTIFICATIONS,
} from './rabbitmq.constants';

/**
 * Gestor de conexión a RabbitMQ para los puentes de integración salientes de
 * tutoring (gamificación y notificaciones). Mantiene una única conexión y un
 * canal de publicación, declara los exchanges (topic, durables) y reconecta
 * cada 5s si la conexión se cae. Si `RABBITMQ_URL` no está definida, el servicio
 * queda inactivo y `publish` se vuelve un no-op (útil en dev/tests sin broker).
 */
@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: ChannelModel;
  private channel?: Channel;
  private shuttingDown = false;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('RABBITMQ_URL');
    if (!url) {
      this.logger.warn(
        'RABBITMQ_URL no definida; los eventos no se publicarán a RabbitMQ.',
      );
      return;
    }
    await this.connect(url);
  }

  private async connect(url: string): Promise<void> {
    try {
      this.connection = await connect(url);
      this.connection.on('error', (err) =>
        this.logger.error(`RabbitMQ connection error: ${err.message}`),
      );
      this.connection.on('close', () => {
        this.channel = undefined;
        if (!this.shuttingDown) this.scheduleReconnect(url);
      });

      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(EXCHANGE_EVENTS, 'topic', {
        durable: true,
      });
      await this.channel.assertExchange(EXCHANGE_NOTIFICATIONS, 'topic', {
        durable: true,
      });
      this.logger.log('Conexión a RabbitMQ establecida (publisher).');
    } catch (err) {
      this.logger.error('Error al conectar con RabbitMQ:', err);
      this.scheduleReconnect(url);
    }
  }

  private scheduleReconnect(url: string): void {
    if (this.shuttingDown || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.logger.log('Reintentando conexión a RabbitMQ...');
      void this.connect(url);
    }, 5000);
  }

  /**
   * Publica un mensaje JSON persistente en un exchange con la routing key dada.
   * Devuelve `false` (sin lanzar) si no hay canal disponible, para no romper el
   * flujo de dominio cuando el broker está caído.
   */
  publish(exchange: string, routingKey: string, payload: unknown): boolean {
    if (!this.channel) {
      this.logger.warn(
        `Sin canal RabbitMQ; se omite publicación "${routingKey}".`,
      );
      return false;
    }
    return this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, contentType: 'application/json' },
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.shuttingDown = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      /* ignore */
    }
  }
}

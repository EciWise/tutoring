import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DisponibilidadPublicada } from '../../domain/events/disponibilidad-publicada.event';
import { MaterializarVentanaUseCase } from '../../application/use-cases/materializar-ventana.use-case';

/**
 * Al publicar una disponibilidad, materializa la ventana inmediatamente para que
 * las tutorías sean visibles a los estudiantes sin esperar el cron nocturno.
 * Idempotente: sesiones ya existentes se cuentan como omitidas.
 */
@Injectable()
export class DisponibilidadPublicadaListener {
  private readonly logger = new Logger(DisponibilidadPublicadaListener.name);

  constructor(private readonly materializar: MaterializarVentanaUseCase) {}

  @OnEvent('disponibilidad.publicada')
  async handle(event: DisponibilidadPublicada): Promise<void> {
    const { creadas, omitidas } = await this.materializar.ejecutar();
    this.logger.log(
      `Materialización tras disponibilidad ${event.disponibilidadId}: ${creadas} creadas, ${omitidas} omitidas.`,
    );
  }
}

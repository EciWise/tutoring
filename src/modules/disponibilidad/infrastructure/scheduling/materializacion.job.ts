import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaterializarVentanaUseCase } from '../../application/use-cases/materializar-ventana.use-case';

/**
 * Cron de materialización: expande las disponibilidades en la ventana móvil una
 * vez al día. Es idempotente (delega en `MaterializarVentana`), así que correrlo
 * de más no duplica. El disparo manual vive en `MaterializacionController`.
 */
@Injectable()
export class MaterializacionJob {
  private readonly logger = new Logger(MaterializacionJob.name);

  constructor(private readonly materializar: MaterializarVentanaUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async ejecutar(): Promise<void> {
    const { creadas, omitidas } = await this.materializar.ejecutar();
    this.logger.log(
      `Materialización programada: ${creadas} creadas, ${omitidas} omitidas.`,
    );
  }
}

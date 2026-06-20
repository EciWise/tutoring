import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConflictError } from '../../../../shared/domain/errors/domain-error';
import {
  EVENT_PUBLISHER,
  type IEventPublisher,
} from '../../../../shared/domain/events/event-publisher.port';
import { TutoriaMaterializada } from '../../../tutorias/domain/events/tutoria-materializada.event';
import {
  TUTORIA_REPOSITORY,
  type ITutoriaRepository,
} from '../../../tutorias/domain/ports/outbound/tutoria.repository.port';
import { addDays, aUTCDate } from '../../domain/fecha.util';
import { calcularFechasMaterializables } from '../../domain/franja-materializacion';
import {
  DISPONIBILIDAD_REPOSITORY,
  type IDisponibilidadRepository,
} from '../../domain/ports/outbound/disponibilidad.repository.port';

export interface ResultadoMaterializacion {
  creadas: number;
  omitidas: number;
}

/**
 * Expande las disponibilidades activas en tutorías PROGRAMADAS dentro de una
 * ventana móvil de `MATERIALIZACION_VENTANA_SEMANAS`. Idempotente: si la tutoría
 * `(tutor, franja, fecha)` ya existe, el `ConflictError` del repo se cuenta como
 * omitida. Invocable por el cron o manualmente. Emite `TutoriaMaterializada`.
 */
@Injectable()
export class MaterializarVentanaUseCase {
  private readonly ventanaSemanas: number;

  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly disponibilidades: IDisponibilidadRepository,
    @Inject(TUTORIA_REPOSITORY)
    private readonly tutorias: ITutoriaRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
    config: ConfigService,
  ) {
    this.ventanaSemanas = Number(
      config.get('MATERIALIZACION_VENTANA_SEMANAS') ?? 2,
    );
  }

  async ejecutar(): Promise<ResultadoMaterializacion> {
    const ventanaDesde = aUTCDate(new Date());
    const ventanaHasta = addDays(ventanaDesde, this.ventanaSemanas * 7);
    const activas = await this.disponibilidades.listarActivas();

    let creadas = 0;
    let omitidas = 0;
    for (const disp of activas) {
      const fechas = calcularFechasMaterializables(
        disp.franjaDiaSemana,
        disp.vigencia,
        ventanaDesde,
        ventanaHasta,
      );
      for (const fecha of fechas) {
        const tutoria = disp.materializarEn(fecha);
        try {
          await this.tutorias.guardar(tutoria);
          creadas++;
          await this.eventos.publish(
            new TutoriaMaterializada(
              tutoria.id,
              tutoria.tutorUserId,
              disp.id,
              fecha,
            ),
          );
        } catch (error) {
          if (error instanceof ConflictError) {
            omitidas++;
          } else {
            throw error;
          }
        }
      }
    }
    return { creadas, omitidas };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import {
  BusinessRuleViolation,
  NotFoundError,
} from '../../../../shared/domain/errors/domain-error';
import {
  EVENT_PUBLISHER,
  type IEventPublisher,
} from '../../../../shared/domain/events/event-publisher.port';
import {
  FRANJA_HORARIA_CONSULTA,
  type IFranjaHorariaConsultaPort,
} from '../../../catalogos/domain/ports/outbound/franja-horaria-consulta.port';
import {
  TUTOR_MATERIA_CONSULTA,
  type ITutorMateriaConsultaPort,
} from '../../../catalogos/domain/ports/outbound/tutor-materia-consulta.port';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import { DisponibilidadPublicada } from '../../domain/events/disponibilidad-publicada.event';
import {
  DISPONIBILIDAD_REPOSITORY,
  type IDisponibilidadRepository,
} from '../../domain/ports/outbound/disponibilidad.repository.port';

/**
 * RF-01: publica una plantilla de disponibilidad. Valida RN-03/RN-05 (la materia
 * debe estar asignada y autorizada al tutor) y que la franja exista/esté activa;
 * fija el `diaSemana` desde la franja. Emite `DisponibilidadPublicada`.
 */
@Injectable()
export class PublicarDisponibilidadUseCase {
  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly repo: IDisponibilidadRepository,
    @Inject(TUTOR_MATERIA_CONSULTA)
    private readonly tutorMateria: ITutorMateriaConsultaPort,
    @Inject(FRANJA_HORARIA_CONSULTA)
    private readonly franjas: IFranjaHorariaConsultaPort,
    @Inject(EVENT_PUBLISHER)
    private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(input: {
    tutorUserId: string;
    franjaId: string;
    materiaId: string;
    salaId?: string | null;
    modalidad: Modalidad;
    cuposMaximos: number;
    vigenciaDesde: Date;
    vigenciaHasta: Date;
  }): Promise<DisponibilidadTutor> {
    const autorizada = await this.tutorMateria.estaAutorizada(
      input.tutorUserId,
      input.materiaId,
    );
    if (!autorizada) {
      throw new BusinessRuleViolation(
        'El tutor no tiene la materia asignada y autorizada (RN-03/RN-05).',
      );
    }

    const franja = await this.franjas.obtenerPorId(input.franjaId);
    if (!franja || !franja.activa) {
      throw new NotFoundError(
        `Franja horaria no encontrada o inactiva: ${input.franjaId}`,
      );
    }

    const disponibilidad = DisponibilidadTutor.crear({
      tutorUserId: input.tutorUserId,
      franjaId: input.franjaId,
      franjaDiaSemana: franja.diaSemana,
      materiaId: input.materiaId,
      salaId: input.salaId,
      modalidad: input.modalidad,
      cuposMaximos: input.cuposMaximos,
      vigenciaDesde: input.vigenciaDesde,
      vigenciaHasta: input.vigenciaHasta,
    });

    await this.repo.guardar(disponibilidad);
    await this.eventos.publish(
      new DisponibilidadPublicada(
        disponibilidad.id,
        disponibilidad.tutorUserId,
        disponibilidad.franjaId,
        disponibilidad.materiaId,
      ),
    );
    return disponibilidad;
  }
}

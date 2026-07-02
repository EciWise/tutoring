import { Inject, Injectable } from '@nestjs/common';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import {
  TUTORIA_REPOSITORY,
  type ITutoriaRepository,
} from '../../../tutorias/domain/ports/outbound/tutoria.repository.port';
import { aUTCDate } from '../../domain/fecha.util';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import {
  DISPONIBILIDAD_REPOSITORY,
  type IDisponibilidadRepository,
} from '../../domain/ports/outbound/disponibilidad.repository.port';
import { exigirPropietario, type ActorDisponibilidad } from './autorizacion';

/**
 * RF-02: modifica una plantilla. Propaga el nuevo cupo a las tutorías futuras
 * PROGRAMADAS (las que aún caben en la capacidad); el resto de campos no altera
 * tutorías ya materializadas.
 */
@Injectable()
export class EditarDisponibilidadUseCase {
  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly repo: IDisponibilidadRepository,
    @Inject(TUTORIA_REPOSITORY)
    private readonly tutorias: ITutoriaRepository,
  ) {}

  async ejecutar(input: {
    id: string;
    actor: ActorDisponibilidad;
    cambios: {
      materiaId?: string;
      salaId?: string | null;
      modalidad?: Modalidad;
      cuposMaximos?: number;
      vigenciaDesde?: Date;
      vigenciaHasta?: Date;
    };
  }): Promise<DisponibilidadTutor> {
    const disponibilidad = await this.repo.obtenerPorId(input.id);
    if (!disponibilidad) {
      throw new NotFoundError(`No existe la disponibilidad: ${input.id}`);
    }
    exigirPropietario(disponibilidad.tutorUserId, input.actor);
    disponibilidad.editar(input.cambios);
    await this.repo.actualizar(disponibilidad);
    const hoy = aUTCDate(new Date());
    if (input.cambios.cuposMaximos !== undefined) {
      await this.tutorias.actualizarCuposFuturasPorDisponibilidad(
        disponibilidad.id,
        disponibilidad.cuposMaximos,
        hoy,
      );
    }
    // Si cambió la materia/modalidad/sala, propagarlo a las tutorías futuras ya
    // materializadas; de lo contrario el estudiante/admin vería la materia que el
    // tutor ofrecía antes y no la actual.
    if (
      input.cambios.materiaId !== undefined ||
      input.cambios.modalidad !== undefined ||
      input.cambios.salaId !== undefined
    ) {
      await this.tutorias.actualizarDatosFuturasPorDisponibilidad(
        disponibilidad.id,
        {
          materiaId: disponibilidad.materiaId,
          modalidad: disponibilidad.modalidad,
          salaId: disponibilidad.salaId,
        },
        hoy,
      );
    }
    return disponibilidad;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import {
  DISPONIBILIDAD_REPOSITORY,
  type IDisponibilidadRepository,
} from '../../domain/ports/outbound/disponibilidad.repository.port';
import { exigirPropietario, type ActorDisponibilidad } from './autorizacion';

/** RF-02: modifica una plantilla. No altera tutorías ya materializadas. */
@Injectable()
export class EditarDisponibilidadUseCase {
  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly repo: IDisponibilidadRepository,
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
    return disponibilidad;
  }
}

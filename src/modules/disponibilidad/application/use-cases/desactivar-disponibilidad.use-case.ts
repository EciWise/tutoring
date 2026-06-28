import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import {
  DISPONIBILIDAD_REPOSITORY,
  type IDisponibilidadRepository,
} from '../../domain/ports/outbound/disponibilidad.repository.port';
import { exigirPropietario, type ActorDisponibilidad } from './autorizacion';

/** RF-02: desactiva una plantilla (baja lógica). No altera tutorías materializadas. */
@Injectable()
export class DesactivarDisponibilidadUseCase {
  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly repo: IDisponibilidadRepository,
  ) {}

  async ejecutar(
    id: string,
    actor: ActorDisponibilidad,
  ): Promise<DisponibilidadTutor> {
    const disponibilidad = await this.repo.obtenerPorId(id);
    if (!disponibilidad) {
      throw new NotFoundError(`No existe la disponibilidad: ${id}`);
    }
    exigirPropietario(disponibilidad.tutorUserId, actor);
    disponibilidad.desactivar();
    await this.repo.actualizar(disponibilidad);
    return disponibilidad;
  }
}

import { Inject, Injectable } from '@nestjs/common';
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
 * RF-02: desactiva una plantilla (baja lógica) y cancela en cascada las tutorías
 * PROGRAMADAS futuras que se originaron de ella, para que el estudiante no vea
 * slots que el tutor ya no ofrece.
 */
@Injectable()
export class DesactivarDisponibilidadUseCase {
  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly repo: IDisponibilidadRepository,
    @Inject(TUTORIA_REPOSITORY)
    private readonly tutorias: ITutoriaRepository,
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
    await this.tutorias.cancelarFuturasPorDisponibilidad(
      id,
      aUTCDate(new Date()),
    );
    return disponibilidad;
  }
}

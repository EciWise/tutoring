import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { TutorMateria } from '../../domain/entities/tutor-materia.entity';
import {
  type ITutorMateriaRepository,
  TUTOR_MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/tutor-materia.repository.port';

/** Autoriza o desautoriza una asignación tutor-materia. Sirve a dos endpoints. */
@Injectable()
export class CambiarAutorizacionTutorMateriaUseCase {
  constructor(
    @Inject(TUTOR_MATERIA_REPOSITORY)
    private readonly repo: ITutorMateriaRepository,
  ) {}

  async ejecutar(id: string, autorizada: boolean): Promise<TutorMateria> {
    const asignacion = await this.repo.obtenerPorId(id);
    if (!asignacion) {
      throw new NotFoundError(`No existe la asignación tutor-materia: ${id}`);
    }
    if (autorizada) {
      asignacion.autorizar();
    } else {
      asignacion.desautorizar();
    }
    await this.repo.actualizar(asignacion);
    return asignacion;
  }
}

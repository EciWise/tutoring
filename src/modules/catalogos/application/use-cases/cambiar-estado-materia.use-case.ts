import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { Materia } from '../../domain/entities/materia.entity';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';

/** Activa o desactiva una materia (baja lógica). Sirve a dos endpoints REST. */
@Injectable()
export class CambiarEstadoMateriaUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly repo: IMateriaRepository,
  ) {}

  async ejecutar(id: string, activa: boolean): Promise<Materia> {
    const materia = await this.repo.obtenerPorId(id);
    if (!materia) {
      throw new NotFoundError(`No existe la materia: ${id}`);
    }
    if (activa) {
      materia.activar();
    } else {
      materia.desactivar();
    }
    await this.repo.actualizar(materia);
    return materia;
  }
}

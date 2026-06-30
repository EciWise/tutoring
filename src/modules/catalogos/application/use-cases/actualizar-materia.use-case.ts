import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { Materia } from '../../domain/entities/materia.entity';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';

export interface ActualizarMateriaCambios {
  codigo?: string;
  nombre?: string;
  activa?: boolean;
}

/** Edita los datos de una materia (código, nombre y/o estado). */
@Injectable()
export class ActualizarMateriaUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly repo: IMateriaRepository,
  ) {}

  async ejecutar(
    id: string,
    cambios: ActualizarMateriaCambios,
  ): Promise<Materia> {
    const materia = await this.repo.obtenerPorId(id);
    if (!materia) {
      throw new NotFoundError(`No existe la materia: ${id}`);
    }
    materia.actualizarDatos(cambios.codigo, cambios.nombre);
    if (cambios.activa !== undefined) {
      if (cambios.activa) {
        materia.activar();
      } else {
        materia.desactivar();
      }
    }
    await this.repo.actualizar(materia);
    return materia;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Materia } from '../../domain/entities/materia.entity';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';

@Injectable()
export class CrearMateriaUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly repo: IMateriaRepository,
  ) {}

  async ejecutar(input: { codigo: string; nombre: string }): Promise<Materia> {
    const materia = Materia.crear(input.codigo, input.nombre);
    await this.repo.guardar(materia);
    return materia;
  }
}

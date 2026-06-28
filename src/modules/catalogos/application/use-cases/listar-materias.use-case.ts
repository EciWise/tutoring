import { Inject, Injectable } from '@nestjs/common';
import { Materia } from '../../domain/entities/materia.entity';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';

@Injectable()
export class ListarMateriasUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly repo: IMateriaRepository,
  ) {}

  async ejecutar(soloActivas?: boolean): Promise<Materia[]> {
    return this.repo.listar(soloActivas);
  }
}

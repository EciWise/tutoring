import { Inject, Injectable } from '@nestjs/common';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';

@Injectable()
export class EliminarMateriaUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly repo: IMateriaRepository,
  ) {}

  async ejecutar(id: string): Promise<void> {
    return this.repo.eliminar(id);
  }
}

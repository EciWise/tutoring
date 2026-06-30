import { Inject, Injectable } from '@nestjs/common';
import { SALA_REPOSITORY } from '../../domain/ports/outbound/sala.repository.port';
import type { ISalaRepository } from '../../domain/ports/outbound/sala.repository.port';

@Injectable()
export class EliminarSalaUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly repo: ISalaRepository,
  ) {}

  async ejecutar(id: string): Promise<void> {
    return this.repo.eliminar(id);
  }
}

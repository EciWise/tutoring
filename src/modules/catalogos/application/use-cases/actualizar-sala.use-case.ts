import { Inject, Injectable } from '@nestjs/common';
import { Sala } from '../../domain/entities/sala.entity';
import {
  ActualizarSalaCambios,
  SALA_REPOSITORY,
} from '../../domain/ports/outbound/sala.repository.port';
import type { ISalaRepository } from '../../domain/ports/outbound/sala.repository.port';

@Injectable()
export class ActualizarSalaUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly repo: ISalaRepository,
  ) {}

  async ejecutar(id: string, cambios: ActualizarSalaCambios): Promise<Sala> {
    return this.repo.actualizar(id, cambios);
  }
}

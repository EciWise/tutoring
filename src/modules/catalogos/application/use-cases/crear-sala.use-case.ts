import { Inject, Injectable } from '@nestjs/common';
import { Sala } from '../../domain/entities/sala.entity';
import {
  type ISalaRepository,
  SALA_REPOSITORY,
} from '../../domain/ports/outbound/sala.repository.port';

@Injectable()
export class CrearSalaUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly repo: ISalaRepository,
  ) {}

  async ejecutar(input: {
    codigo: string;
    edificio?: string | null;
  }): Promise<Sala> {
    const sala = Sala.crear(input.codigo, input.edificio);
    await this.repo.guardar(sala);
    return sala;
  }
}

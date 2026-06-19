import { Inject, Injectable } from '@nestjs/common';
import { Sala } from '../../domain/entities/sala.entity';
import {
  type ISalaRepository,
  SALA_REPOSITORY,
} from '../../domain/ports/outbound/sala.repository.port';

@Injectable()
export class ListarSalasUseCase {
  constructor(
    @Inject(SALA_REPOSITORY)
    private readonly repo: ISalaRepository,
  ) {}

  async ejecutar(): Promise<Sala[]> {
    return this.repo.listar();
  }
}

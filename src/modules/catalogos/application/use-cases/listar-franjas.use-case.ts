import { Inject, Injectable } from '@nestjs/common';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';
import {
  FRANJA_HORARIA_REPOSITORY,
  type IFranjaHorariaRepository,
} from '../../domain/ports/outbound/franja-horaria.repository.port';

@Injectable()
export class ListarFranjasUseCase {
  constructor(
    @Inject(FRANJA_HORARIA_REPOSITORY)
    private readonly repo: IFranjaHorariaRepository,
  ) {}

  async ejecutar(dia?: number): Promise<FranjaHoraria[]> {
    return this.repo.listarPorDia(dia);
  }
}

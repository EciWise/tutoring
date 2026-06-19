import { Inject, Injectable } from '@nestjs/common';
import { FranjaHoraria } from '../../domain/entities/franja-horaria.entity';
import {
  FRANJA_HORARIA_REPOSITORY,
  type IFranjaHorariaRepository,
} from '../../domain/ports/outbound/franja-horaria.repository.port';

@Injectable()
export class CrearFranjaUseCase {
  constructor(
    @Inject(FRANJA_HORARIA_REPOSITORY)
    private readonly repo: IFranjaHorariaRepository,
  ) {}

  async ejecutar(input: {
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    orden: number;
  }): Promise<FranjaHoraria> {
    const franja = FranjaHoraria.crear(
      input.diaSemana,
      input.horaInicio,
      input.horaFin,
      input.orden,
    );
    await this.repo.guardar(franja);
    return franja;
  }
}

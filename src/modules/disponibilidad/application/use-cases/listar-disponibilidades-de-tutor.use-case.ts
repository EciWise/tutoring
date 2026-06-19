import { Inject, Injectable } from '@nestjs/common';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import {
  DISPONIBILIDAD_REPOSITORY,
  type IDisponibilidadRepository,
} from '../../domain/ports/outbound/disponibilidad.repository.port';

/** RF-03 (parcial): plantillas de disponibilidad de un tutor. */
@Injectable()
export class ListarDisponibilidadesDeTutorUseCase {
  constructor(
    @Inject(DISPONIBILIDAD_REPOSITORY)
    private readonly repo: IDisponibilidadRepository,
  ) {}

  async ejecutar(tutorUserId: string): Promise<DisponibilidadTutor[]> {
    return this.repo.listarPorTutor(tutorUserId);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { TutorMateria } from '../../domain/entities/tutor-materia.entity';
import {
  type ITutorMateriaRepository,
  TUTOR_MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/tutor-materia.repository.port';

/** Lista las asignaciones (materias) de un tutor. Soporta RN-05. */
@Injectable()
export class ListarMateriasDeTutorUseCase {
  constructor(
    @Inject(TUTOR_MATERIA_REPOSITORY)
    private readonly repo: ITutorMateriaRepository,
  ) {}

  async ejecutar(tutorUserId: string): Promise<TutorMateria[]> {
    return this.repo.listarPorTutor(tutorUserId);
  }
}

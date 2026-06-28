import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { TutorMateria } from '../../domain/entities/tutor-materia.entity';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';
import {
  type ITutorMateriaRepository,
  TUTOR_MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/tutor-materia.repository.port';

/**
 * Asigna una materia a un tutor (soporta RN-03/RN-05). Valida que la materia
 * exista antes de crear la asignación para devolver un 404 claro en vez de una
 * violación de FK cruda. La unicidad `(materia, tutor)` la garantiza la BD.
 */
@Injectable()
export class AsignarTutorMateriaUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly materiaRepo: IMateriaRepository,
    @Inject(TUTOR_MATERIA_REPOSITORY)
    private readonly tutorMateriaRepo: ITutorMateriaRepository,
  ) {}

  async ejecutar(input: {
    materiaId: string;
    tutorUserId: string;
    autorizada?: boolean;
  }): Promise<TutorMateria> {
    const materia = await this.materiaRepo.obtenerPorId(input.materiaId);
    if (!materia) {
      throw new NotFoundError(`No existe la materia: ${input.materiaId}`);
    }
    const asignacion = TutorMateria.crear(
      input.materiaId,
      input.tutorUserId,
      input.autorizada ?? true,
    );
    await this.tutorMateriaRepo.guardar(asignacion);
    return asignacion;
  }
}

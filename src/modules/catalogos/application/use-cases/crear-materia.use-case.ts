import { Inject, Injectable } from '@nestjs/common';
import { Materia } from '../../domain/entities/materia.entity';
import {
  type IMateriaRepository,
  MATERIA_REPOSITORY,
} from '../../domain/ports/outbound/materia.repository.port';
import {
  type ISubjectEventPublisher,
  SUBJECT_EVENT_PUBLISHER,
} from '../../domain/ports/outbound/subject-event-publisher.port';

@Injectable()
export class CrearMateriaUseCase {
  constructor(
    @Inject(MATERIA_REPOSITORY)
    private readonly repo: IMateriaRepository,
    @Inject(SUBJECT_EVENT_PUBLISHER)
    private readonly eventPublisher: ISubjectEventPublisher,
  ) {}

  async ejecutar(input: { codigo: string; nombre: string }): Promise<Materia> {
    const materia = Materia.crear(input.codigo, input.nombre);
    await this.repo.guardar(materia);
    this.eventPublisher.publishCreated({ id: materia.id, codigo: materia.codigo, nombre: materia.nombre });
    return materia;
  }
}

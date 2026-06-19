import { ConflictError } from '../../../../shared/domain/errors/domain-error';
import { Materia } from '../../domain/entities/materia.entity';
import { IMateriaRepository } from '../../domain/ports/outbound/materia.repository.port';
import { TutorMateria } from '../../domain/entities/tutor-materia.entity';
import { ITutorMateriaRepository } from '../../domain/ports/outbound/tutor-materia.repository.port';

/**
 * Fakes in-memory de los puertos outbound para tests de casos de uso. Simulan
 * la unicidad que en producción garantiza la BD, para poder ejercitar la rama
 * de `ConflictError` sin Prisma. Devuelven Promesas sin `async` (no hay I/O).
 */
export class InMemoryMateriaRepository implements IMateriaRepository {
  private readonly data = new Map<string, Materia>();

  guardar(materia: Materia): Promise<void> {
    const duplicado = [...this.data.values()].some(
      (m) => m.codigo === materia.codigo,
    );
    if (duplicado) {
      return Promise.reject(
        new ConflictError(`Código de materia duplicado: ${materia.codigo}`),
      );
    }
    this.data.set(materia.id, materia);
    return Promise.resolve();
  }

  actualizar(materia: Materia): Promise<void> {
    this.data.set(materia.id, materia);
    return Promise.resolve();
  }

  obtenerPorId(id: string): Promise<Materia | null> {
    return Promise.resolve(this.data.get(id) ?? null);
  }

  listar(soloActivas?: boolean): Promise<Materia[]> {
    const todas = [...this.data.values()];
    return Promise.resolve(soloActivas ? todas.filter((m) => m.activa) : todas);
  }
}

export class InMemoryTutorMateriaRepository implements ITutorMateriaRepository {
  private readonly data = new Map<string, TutorMateria>();

  guardar(tm: TutorMateria): Promise<void> {
    const duplicado = [...this.data.values()].some(
      (x) => x.materiaId === tm.materiaId && x.tutorUserId === tm.tutorUserId,
    );
    if (duplicado) {
      return Promise.reject(
        new ConflictError('La materia ya está asignada a ese tutor.'),
      );
    }
    this.data.set(tm.id, tm);
    return Promise.resolve();
  }

  actualizar(tm: TutorMateria): Promise<void> {
    this.data.set(tm.id, tm);
    return Promise.resolve();
  }

  obtenerPorId(id: string): Promise<TutorMateria | null> {
    return Promise.resolve(this.data.get(id) ?? null);
  }

  listarPorTutor(tutorUserId: string): Promise<TutorMateria[]> {
    return Promise.resolve(
      [...this.data.values()].filter((x) => x.tutorUserId === tutorUserId),
    );
  }
}

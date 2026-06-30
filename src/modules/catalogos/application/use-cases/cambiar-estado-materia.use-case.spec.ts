import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { CambiarEstadoMateriaUseCase } from './cambiar-estado-materia.use-case';
import { CrearMateriaUseCase } from './crear-materia.use-case';
import { InMemoryMateriaRepository, InMemorySubjectEventPublisher } from './fakes';

describe('CambiarEstadoMateriaUseCase', () => {
  it('desactiva y reactiva una materia existente', async () => {
    const repo = new InMemoryMateriaRepository();
    const publisher = new InMemorySubjectEventPublisher();
    const materia = await new CrearMateriaUseCase(repo, publisher).ejecutar({
      codigo: 'FISI',
      nombre: 'Física',
    });
    const useCase = new CambiarEstadoMateriaUseCase(repo, publisher);

    expect((await useCase.ejecutar(materia.id, false)).activa).toBe(false);
    expect((await useCase.ejecutar(materia.id, true)).activa).toBe(true);
    // 1 created + 2 updated
    expect(publisher.events.filter((e) => e.type === 'subject.updated')).toHaveLength(2);
  });

  it('lanza NotFoundError si la materia no existe', async () => {
    const publisher = new InMemorySubjectEventPublisher();
    const useCase = new CambiarEstadoMateriaUseCase(
      new InMemoryMateriaRepository(),
      publisher,
    );
    await expect(useCase.ejecutar('inexistente', false)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

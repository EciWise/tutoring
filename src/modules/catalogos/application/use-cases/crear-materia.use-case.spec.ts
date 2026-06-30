import { ConflictError } from '../../../../shared/domain/errors/domain-error';
import { CrearMateriaUseCase } from './crear-materia.use-case';
import { ListarMateriasUseCase } from './listar-materias.use-case';
import { InMemoryMateriaRepository, InMemorySubjectEventPublisher } from './fakes';

describe('CrearMateriaUseCase', () => {
  it('crea una materia y la persiste', async () => {
    const repo = new InMemoryMateriaRepository();
    const publisher = new InMemorySubjectEventPublisher();
    const materia = await new CrearMateriaUseCase(repo, publisher).ejecutar({
      codigo: 'MATD1101',
      nombre: 'Cálculo Diferencial',
    });

    expect(materia.codigo).toBe('MATD1101');
    expect(await new ListarMateriasUseCase(repo).ejecutar()).toHaveLength(1);
    expect(publisher.events).toHaveLength(1);
    expect(publisher.events[0].type).toBe('subject.created');
  });

  it('rechaza un código de materia duplicado (ConflictError)', async () => {
    const repo = new InMemoryMateriaRepository();
    const publisher = new InMemorySubjectEventPublisher();
    const useCase = new CrearMateriaUseCase(repo, publisher);
    await useCase.ejecutar({ codigo: 'FISI', nombre: 'Física' });

    await expect(
      useCase.ejecutar({ codigo: 'FISI', nombre: 'Física II' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

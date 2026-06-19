import { ConflictError } from '../../../../shared/domain/errors/domain-error';
import { CrearMateriaUseCase } from './crear-materia.use-case';
import { ListarMateriasUseCase } from './listar-materias.use-case';
import { InMemoryMateriaRepository } from './fakes';

describe('CrearMateriaUseCase', () => {
  it('crea una materia y la persiste', async () => {
    const repo = new InMemoryMateriaRepository();
    const materia = await new CrearMateriaUseCase(repo).ejecutar({
      codigo: 'MATD1101',
      nombre: 'Cálculo Diferencial',
    });

    expect(materia.codigo).toBe('MATD1101');
    expect(await new ListarMateriasUseCase(repo).ejecutar()).toHaveLength(1);
  });

  it('rechaza un código de materia duplicado (ConflictError)', async () => {
    const repo = new InMemoryMateriaRepository();
    const useCase = new CrearMateriaUseCase(repo);
    await useCase.ejecutar({ codigo: 'FISI', nombre: 'Física' });

    await expect(
      useCase.ejecutar({ codigo: 'FISI', nombre: 'Física II' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

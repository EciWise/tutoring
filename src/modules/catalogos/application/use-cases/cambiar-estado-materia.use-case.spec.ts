import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { CambiarEstadoMateriaUseCase } from './cambiar-estado-materia.use-case';
import { CrearMateriaUseCase } from './crear-materia.use-case';
import { InMemoryMateriaRepository } from './fakes';

describe('CambiarEstadoMateriaUseCase', () => {
  it('desactiva y reactiva una materia existente', async () => {
    const repo = new InMemoryMateriaRepository();
    const materia = await new CrearMateriaUseCase(repo).ejecutar({
      codigo: 'FISI',
      nombre: 'Física',
    });
    const useCase = new CambiarEstadoMateriaUseCase(repo);

    expect((await useCase.ejecutar(materia.id, false)).activa).toBe(false);
    expect((await useCase.ejecutar(materia.id, true)).activa).toBe(true);
  });

  it('lanza NotFoundError si la materia no existe', async () => {
    const useCase = new CambiarEstadoMateriaUseCase(
      new InMemoryMateriaRepository(),
    );
    await expect(useCase.ejecutar('inexistente', false)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

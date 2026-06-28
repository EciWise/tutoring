import { NotFoundError } from '../../../../shared/domain/errors/domain-error';
import { AsignarTutorMateriaUseCase } from './asignar-tutor-materia.use-case';
import { CambiarAutorizacionTutorMateriaUseCase } from './cambiar-autorizacion-tutor-materia.use-case';
import { CrearMateriaUseCase } from './crear-materia.use-case';
import { ListarMateriasDeTutorUseCase } from './listar-materias-de-tutor.use-case';
import {
  InMemoryMateriaRepository,
  InMemoryTutorMateriaRepository,
} from './fakes';

const TUTOR = '11111111-1111-1111-1111-111111111111';

describe('Casos de uso tutor-materia', () => {
  it('asigna una materia existente a un tutor y la lista', async () => {
    const materiaRepo = new InMemoryMateriaRepository();
    const tmRepo = new InMemoryTutorMateriaRepository();
    const materia = await new CrearMateriaUseCase(materiaRepo).ejecutar({
      codigo: 'FISI',
      nombre: 'Física',
    });

    const asignacion = await new AsignarTutorMateriaUseCase(
      materiaRepo,
      tmRepo,
    ).ejecutar({ materiaId: materia.id, tutorUserId: TUTOR });

    expect(asignacion.autorizada).toBe(true);
    const delTutor = await new ListarMateriasDeTutorUseCase(tmRepo).ejecutar(
      TUTOR,
    );
    expect(delTutor).toHaveLength(1);
    expect(delTutor[0].materiaId).toBe(materia.id);
  });

  it('lanza NotFoundError al asignar una materia inexistente', async () => {
    const useCase = new AsignarTutorMateriaUseCase(
      new InMemoryMateriaRepository(),
      new InMemoryTutorMateriaRepository(),
    );
    await expect(
      useCase.ejecutar({ materiaId: 'no-existe', tutorUserId: TUTOR }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('desautoriza una asignación existente', async () => {
    const materiaRepo = new InMemoryMateriaRepository();
    const tmRepo = new InMemoryTutorMateriaRepository();
    const materia = await new CrearMateriaUseCase(materiaRepo).ejecutar({
      codigo: 'FISI',
      nombre: 'Física',
    });
    const asignacion = await new AsignarTutorMateriaUseCase(
      materiaRepo,
      tmRepo,
    ).ejecutar({ materiaId: materia.id, tutorUserId: TUTOR });

    const actualizada = await new CambiarAutorizacionTutorMateriaUseCase(
      tmRepo,
    ).ejecutar(asignacion.id, false);
    expect(actualizada.autorizada).toBe(false);
  });

  it('lanza NotFoundError al cambiar autorización de una asignación inexistente', async () => {
    const useCase = new CambiarAutorizacionTutorMateriaUseCase(
      new InMemoryTutorMateriaRepository(),
    );
    await expect(useCase.ejecutar('no-existe', true)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

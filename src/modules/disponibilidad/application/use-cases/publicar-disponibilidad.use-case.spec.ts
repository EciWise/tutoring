import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import {
  BusinessRuleViolation,
  NotFoundError,
} from '../../../../shared/domain/errors/domain-error';
import { PublicarDisponibilidadUseCase } from './publicar-disponibilidad.use-case';
import {
  FakeFranjaConsulta,
  FakeTutorMateriaConsulta,
  InMemoryDisponibilidadRepository,
  InMemoryTutoriaRepository,
  NoopEventPublisher,
} from './fakes';

const INPUT = {
  tutorUserId: 'tutor-1',
  franjaId: 'franja-1',
  materiaId: 'materia-1',
  modalidad: Modalidad.VIRTUAL,
  cuposMaximos: 4,
  vigenciaDesde: new Date('2026-06-01'),
  vigenciaHasta: new Date('2026-12-31'),
};

function construir(autorizada: boolean, franjaActiva = true) {
  const repo = new InMemoryDisponibilidadRepository();
  const eventos = new NoopEventPublisher();
  const tutorias = new InMemoryTutoriaRepository();
  const useCase = new PublicarDisponibilidadUseCase(
    repo,
    new FakeTutorMateriaConsulta(autorizada),
    new FakeFranjaConsulta(
      franjaActiva ? { id: 'franja-1', diaSemana: 1, activa: true } : null,
    ),
    eventos,
    tutorias,
  );
  return { useCase, repo, eventos, tutorias };
}

describe('PublicarDisponibilidadUseCase', () => {
  it('publica y emite DisponibilidadPublicada cuando el tutor está autorizado', async () => {
    const { useCase, repo, eventos } = construir(true);
    const disp = await useCase.ejecutar(INPUT);

    expect(disp.franjaDiaSemana).toBe(1);
    expect(await repo.listarPorTutor('tutor-1')).toHaveLength(1);
    expect(eventos.publicados).toHaveLength(1);
    expect(eventos.publicados[0].nombre).toBe('disponibilidad.publicada');
  });

  it('rechaza si el tutor no está autorizado para la materia (RN-03/05)', async () => {
    const { useCase } = construir(false);
    await expect(useCase.ejecutar(INPUT)).rejects.toBeInstanceOf(
      BusinessRuleViolation,
    );
  });

  it('lanza NotFoundError si la franja no existe/está inactiva', async () => {
    const { useCase } = construir(true, false);
    await expect(useCase.ejecutar(INPUT)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('al re-publicar una franja existente propaga el cupo asignado a sus tutorías', async () => {
    const { useCase, tutorias } = construir(true);
    const spy = jest.spyOn(tutorias, 'actualizarCuposFuturasPorDisponibilidad');

    const primera = await useCase.ejecutar({ ...INPUT, cuposMaximos: 4 });
    const republicada = await useCase.ejecutar({ ...INPUT, cuposMaximos: 2 });

    expect(republicada.id).toBe(primera.id);
    expect(republicada.cuposMaximos).toBe(2);
    expect(spy).toHaveBeenCalledWith(primera.id, 2, expect.any(Date));
  });
});

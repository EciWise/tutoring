import { EstadoAsistencia } from '../../../../shared/domain/enums/estado-asistencia.enum';
import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import {
  BusinessRuleViolation,
  ConflictError,
  NotFoundError,
} from '../../../../shared/domain/errors/domain-error';
import { TutoriaParaReserva } from '../../domain/ports/outbound/reserva.repository.port';
import { ReservarTutoriaUseCase } from './reservar-tutoria.use-case';
import { InMemoryReservaRepository, NoopEventPublisher } from './fakes';

const FECHA = new Date('2026-06-22');
function tutoria(over: Partial<TutoriaParaReserva> = {}): TutoriaParaReserva {
  return {
    id: 't1',
    tutorUserId: 'tutor-1',
    fecha: FECHA,
    franjaId: 'f1',
    estado: EstadoTutoria.PROGRAMADA,
    cuposMaximos: 2,
    cuposOcupados: 0,
    ...over,
  };
}

describe('ReservarTutoriaUseCase', () => {
  it('reserva: ocupa cupo, crea CONFIRMADA y emite TutoriaReservada', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria());
    const eventos = new NoopEventPublisher();

    const p = await new ReservarTutoriaUseCase(repo, eventos).ejecutar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
      temaEspecifico: 'Recursión',
    });

    expect(p.estadoAsistencia).toBe(EstadoAsistencia.CONFIRMADA);
    expect(repo.cuposOcupados('t1')).toBe(1);
    expect(eventos.publicados[0].nombre).toBe('tutoria.reservada');
  });

  it('tutoría llena → ConflictError (409, RN-09)', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ cuposMaximos: 1, cuposOcupados: 1 }));
    await expect(
      new ReservarTutoriaUseCase(repo, new NoopEventPublisher()).ejecutar({
        tutoriaId: 't1',
        estudianteUserId: 'e1',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('traslape mismo día+franja → BusinessRuleViolation (RN-01)', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1' }));
    repo.sembrarTutoria(tutoria({ id: 't2', tutorUserId: 'tutor-2' }));
    const useCase = new ReservarTutoriaUseCase(repo, new NoopEventPublisher());
    await useCase.ejecutar({ tutoriaId: 't1', estudianteUserId: 'e1' });

    await expect(
      useCase.ejecutar({ tutoriaId: 't2', estudianteUserId: 'e1' }),
    ).rejects.toBeInstanceOf(BusinessRuleViolation);
  });

  it('tutoría no PROGRAMADA → BusinessRuleViolation', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ estado: EstadoTutoria.CANCELADA }));
    await expect(
      new ReservarTutoriaUseCase(repo, new NoopEventPublisher()).ejecutar({
        tutoriaId: 't1',
        estudianteUserId: 'e1',
      }),
    ).rejects.toBeInstanceOf(BusinessRuleViolation);
  });

  it('tutoría inexistente → NotFoundError', async () => {
    await expect(
      new ReservarTutoriaUseCase(
        new InMemoryReservaRepository(),
        new NoopEventPublisher(),
      ).ejecutar({ tutoriaId: 'no-existe', estudianteUserId: 'e1' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

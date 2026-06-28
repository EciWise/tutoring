import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import {
  BusinessRuleViolation,
  ConflictError,
  NotFoundError,
} from '../../../../shared/domain/errors/domain-error';
import { TutoriaParaReserva } from '../../domain/ports/outbound/reserva.repository.port';
import { CancelarReservaUseCase } from './cancelar-reserva.use-case';
import { CancelarTutoriaPorTutorUseCase } from './cancelar-tutoria-por-tutor.use-case';
import { ReprogramarTutoriaUseCase } from './reprogramar-tutoria.use-case';
import { ReservarTutoriaUseCase } from './reservar-tutoria.use-case';
import { InMemoryReservaRepository, NoopEventPublisher } from './fakes';

function tutoria(over: Partial<TutoriaParaReserva>): TutoriaParaReserva {
  return {
    id: 't1',
    tutorUserId: 'tutor-1',
    fecha: new Date('2026-06-22'),
    franjaId: 'f1',
    estado: EstadoTutoria.PROGRAMADA,
    cuposMaximos: 2,
    cuposOcupados: 0,
    ...over,
  };
}

describe('CancelarReservaUseCase', () => {
  it('cancela y libera el cupo', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1' }));
    const eventos = new NoopEventPublisher();
    await new ReservarTutoriaUseCase(repo, eventos).ejecutar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
    });
    expect(repo.cuposOcupados('t1')).toBe(1);

    await new CancelarReservaUseCase(repo, eventos).ejecutar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
      motivo: 'cruce de horario',
    });
    expect(repo.cuposOcupados('t1')).toBe(0);
    expect(eventos.publicados.at(-1)?.nombre).toBe('reserva.cancelada');
  });

  it('sin reserva activa → NotFoundError', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1' }));
    await expect(
      new CancelarReservaUseCase(repo, new NoopEventPublisher()).ejecutar({
        tutoriaId: 't1',
        estudianteUserId: 'e1',
        motivo: 'x',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ReprogramarTutoriaUseCase', () => {
  it('mueve la reserva de origen a destino (atómico)', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1', franjaId: 'f1' }));
    repo.sembrarTutoria(tutoria({ id: 't2', franjaId: 'f2' }));
    const eventos = new NoopEventPublisher();
    await new ReservarTutoriaUseCase(repo, eventos).ejecutar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
    });

    await new ReprogramarTutoriaUseCase(repo, eventos).ejecutar({
      estudianteUserId: 'e1',
      tutoriaOrigenId: 't1',
      tutoriaDestinoId: 't2',
      motivo: 'me queda mejor la otra',
    });

    expect(repo.cuposOcupados('t1')).toBe(0);
    expect(repo.cuposOcupados('t2')).toBe(1);
  });

  it('destino lleno → ConflictError y el origen queda intacto', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1', franjaId: 'f1' }));
    repo.sembrarTutoria(
      tutoria({ id: 't2', franjaId: 'f2', cuposMaximos: 1, cuposOcupados: 1 }),
    );
    const eventos = new NoopEventPublisher();
    await new ReservarTutoriaUseCase(repo, eventos).ejecutar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
    });

    await expect(
      new ReprogramarTutoriaUseCase(repo, eventos).ejecutar({
        estudianteUserId: 'e1',
        tutoriaOrigenId: 't1',
        tutoriaDestinoId: 't2',
        motivo: 'x',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.cuposOcupados('t1')).toBe(1); // intacto
  });
});

describe('CancelarTutoriaPorTutorUseCase', () => {
  it('libera a todos los participantes y cancela la tutoría', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1', cuposMaximos: 5 }));
    const eventos = new NoopEventPublisher();
    const reservar = new ReservarTutoriaUseCase(repo, eventos);
    await reservar.ejecutar({ tutoriaId: 't1', estudianteUserId: 'e1' });
    await reservar.ejecutar({ tutoriaId: 't1', estudianteUserId: 'e2' });

    const r = await new CancelarTutoriaPorTutorUseCase(repo, eventos).ejecutar({
      tutoriaId: 't1',
      actor: { userId: 'tutor-1', esAdmin: false },
      motivo: 'me enfermé',
    });

    expect(r.participantesLiberados).toBe(2);
    expect(repo.estadoTutoria('t1')).toBe(EstadoTutoria.CANCELADA);
  });

  it('otro tutor no puede cancelarla → BusinessRuleViolation', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1', tutorUserId: 'tutor-1' }));
    await expect(
      new CancelarTutoriaPorTutorUseCase(
        repo,
        new NoopEventPublisher(),
      ).ejecutar({
        tutoriaId: 't1',
        actor: { userId: 'otro-tutor', esAdmin: false },
        motivo: 'x',
      }),
    ).rejects.toBeInstanceOf(BusinessRuleViolation);
  });

  it('tutoría no PROGRAMADA → BusinessRuleViolation', async () => {
    const repo = new InMemoryReservaRepository();
    repo.sembrarTutoria(tutoria({ id: 't1', estado: EstadoTutoria.REALIZADA }));
    await expect(
      new CancelarTutoriaPorTutorUseCase(
        repo,
        new NoopEventPublisher(),
      ).ejecutar({
        tutoriaId: 't1',
        actor: { userId: 'tutor-1', esAdmin: false },
        motivo: 'x',
      }),
    ).rejects.toBeInstanceOf(BusinessRuleViolation);
  });
});

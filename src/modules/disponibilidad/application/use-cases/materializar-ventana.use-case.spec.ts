import { ConfigService } from '@nestjs/config';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { DisponibilidadTutor } from '../../domain/entities/disponibilidad-tutor.entity';
import { MaterializarVentanaUseCase } from './materializar-ventana.use-case';
import {
  InMemoryDisponibilidadRepository,
  InMemoryTutoriaRepository,
  NoopEventPublisher,
} from './fakes';

// ventana = 1 semana; config stub.
const config = { get: () => 1 } as unknown as ConfigService;

function diasDesdeHoy(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

describe('MaterializarVentanaUseCase', () => {
  it('materializa las fechas en ventana y es idempotente al re-ejecutar', async () => {
    const dispRepo = new InMemoryDisponibilidadRepository();
    const tutoriaRepo = new InMemoryTutoriaRepository();
    const eventos = new NoopEventPublisher();

    // Disponibilidad de los lunes (ISODOW 1): en una ventana de 8 días hay ≥1 lunes.
    await dispRepo.guardar(
      DisponibilidadTutor.crear({
        tutorUserId: 'tutor-1',
        franjaId: 'franja-1',
        franjaDiaSemana: 1,
        materiaId: 'materia-1',
        modalidad: Modalidad.VIRTUAL,
        cuposMaximos: 4,
        vigenciaDesde: diasDesdeHoy(-7),
        vigenciaHasta: diasDesdeHoy(60),
      }),
    );

    const useCase = new MaterializarVentanaUseCase(
      dispRepo,
      tutoriaRepo,
      eventos,
      config,
    );

    const primera = await useCase.ejecutar();
    expect(primera.creadas).toBeGreaterThan(0);
    expect(primera.omitidas).toBe(0);
    expect(eventos.publicados).toHaveLength(primera.creadas);

    const segunda = await useCase.ejecutar();
    expect(segunda.creadas).toBe(0);
    expect(segunda.omitidas).toBe(primera.creadas);
  });
});

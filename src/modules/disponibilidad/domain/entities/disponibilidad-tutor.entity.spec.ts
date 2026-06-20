import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import {
  BusinessRuleViolation,
  ValidationError,
} from '../../../../shared/domain/errors/domain-error';
import { DisponibilidadTutor } from './disponibilidad-tutor.entity';

// 2026-06-22 es lunes (ISODOW 1); 2026-06-23 es martes (ISODOW 2).
const LUNES = new Date('2026-06-22');
const MARTES = new Date('2026-06-23');

function nueva(
  overrides: Partial<Parameters<typeof DisponibilidadTutor.crear>[0]> = {},
): DisponibilidadTutor {
  return DisponibilidadTutor.crear({
    tutorUserId: 'tutor-1',
    franjaId: 'franja-1',
    franjaDiaSemana: 1,
    materiaId: 'materia-1',
    modalidad: Modalidad.VIRTUAL,
    cuposMaximos: 4,
    vigenciaDesde: new Date('2026-06-01'),
    vigenciaHasta: new Date('2026-12-31'),
    ...overrides,
  });
}

describe('DisponibilidadTutor (agregado)', () => {
  it('exige sala solo cuando es PRESENCIAL', () => {
    expect(() => nueva({ modalidad: Modalidad.PRESENCIAL })).toThrow(
      ValidationError,
    );
    expect(() =>
      nueva({ modalidad: Modalidad.PRESENCIAL, salaId: 'sala-1' }),
    ).not.toThrow();
  });

  it('permite VIRTUAL con sala (tutoría virtual desde un salón físico)', () => {
    const disp = nueva({ modalidad: Modalidad.VIRTUAL, salaId: 'sala-1' });
    expect(disp.modalidad).toBe(Modalidad.VIRTUAL);
    expect(disp.salaId).toBe('sala-1');
  });

  it('permite VIRTUAL sin sala', () => {
    expect(() => nueva({ modalidad: Modalidad.VIRTUAL })).not.toThrow();
  });

  it('materializa una Tutoria PROGRAMADA en una fecha del día de la franja', () => {
    const tutoria = nueva().materializarEn(LUNES);
    expect(tutoria.fecha).toEqual(LUNES);
    expect(tutoria.cuposMaximos).toBe(4);
    expect(tutoria.disponibilidadId).not.toBeNull();
  });

  it('rechaza materializar en un día que no es el de la franja', () => {
    expect(() => nueva().materializarEn(MARTES)).toThrow(ValidationError);
  });

  it('rechaza materializar fuera de la vigencia', () => {
    const disp = nueva({ vigenciaHasta: new Date('2026-06-15') });
    expect(() => disp.materializarEn(LUNES)).toThrow(BusinessRuleViolation);
  });

  it('no permite materializar ni editar si está inactiva', () => {
    const disp = nueva();
    disp.desactivar();
    expect(disp.activa).toBe(false);
    expect(() => disp.materializarEn(LUNES)).toThrow(BusinessRuleViolation);
    expect(() => disp.editar({ cuposMaximos: 2 })).toThrow(
      BusinessRuleViolation,
    );
  });

  it('editar a PRESENCIAL sin sala falla; conservar la sala al pasar a VIRTUAL es válido', () => {
    const disp = nueva({ modalidad: Modalidad.PRESENCIAL, salaId: 'sala-1' });
    // VIRTUAL conservando la sala ahora es válido (virtual desde un salón).
    expect(() => disp.editar({ modalidad: Modalidad.VIRTUAL })).not.toThrow();
    expect(disp.salaId).toBe('sala-1');
    // Volver a PRESENCIAL quitando la sala viola la regla que SÍ se mantiene.
    expect(() =>
      disp.editar({ modalidad: Modalidad.PRESENCIAL, salaId: null }),
    ).toThrow(ValidationError);
  });
});

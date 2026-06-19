import { EstadoTutoria } from '../../../../shared/domain/enums/estado-tutoria.enum';
import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Tutoria } from './tutoria.entity';

const BASE = {
  tutorUserId: 'tutor-1',
  franjaId: 'franja-1',
  fecha: new Date('2026-06-22'),
  materiaId: 'materia-1',
  cuposMaximos: 4,
};

describe('Tutoria (agregado)', () => {
  it('programa una tutoría PRESENCIAL con sala', () => {
    const t = Tutoria.programar({
      ...BASE,
      modalidad: Modalidad.PRESENCIAL,
      salaId: 'sala-1',
    });
    expect(t.estado).toBe(EstadoTutoria.PROGRAMADA);
    expect(t.salaId).toBe('sala-1');
    expect(t.cuposMaximos).toBe(4);
    expect(t.cuposOcupados).toBe(0);
    expect(t.enlaceVirtual).toBeNull();
    expect(t.tieneCupo()).toBe(true);
  });

  it('programa una tutoría VIRTUAL sin sala', () => {
    const t = Tutoria.programar({ ...BASE, modalidad: Modalidad.VIRTUAL });
    expect(t.modalidad).toBe(Modalidad.VIRTUAL);
    expect(t.salaId).toBeNull();
  });

  it('rechaza PRESENCIAL sin sala', () => {
    expect(() =>
      Tutoria.programar({ ...BASE, modalidad: Modalidad.PRESENCIAL }),
    ).toThrow(ValidationError);
  });

  it('permite VIRTUAL con sala (tutoría virtual desde un salón físico)', () => {
    const t = Tutoria.programar({
      ...BASE,
      modalidad: Modalidad.VIRTUAL,
      salaId: 'sala-1',
    });
    expect(t.modalidad).toBe(Modalidad.VIRTUAL);
    expect(t.salaId).toBe('sala-1');
  });

  it('no tiene cupo si está llena', () => {
    const t = Tutoria.reconstituir({
      id: 't1',
      tutorUserId: 'tutor-1',
      franjaId: 'f1',
      fecha: new Date('2026-06-22'),
      materiaId: 'm1',
      salaId: null,
      disponibilidadId: null,
      modalidad: Modalidad.VIRTUAL,
      estado: EstadoTutoria.PROGRAMADA,
      cuposMaximos: 2,
      cuposOcupados: 2,
      enlaceVirtual: null,
      temaGeneral: null,
      motivoCancelacion: null,
    });
    expect(t.tieneCupo()).toBe(false);
  });
});

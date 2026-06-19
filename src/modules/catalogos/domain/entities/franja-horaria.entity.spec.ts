import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { FranjaHoraria } from './franja-horaria.entity';

describe('FranjaHoraria (entidad)', () => {
  it('se crea componiendo DiaSemana y RangoHorario', () => {
    const franja = FranjaHoraria.crear(1, '07:00', '08:30', 1);
    expect(franja.diaSemana).toBe(1);
    expect(franja.horaInicio).toBe('07:00');
    expect(franja.horaFin).toBe('08:30');
    expect(franja.orden).toBe(1);
    expect(franja.activa).toBe(true);
  });

  it('propaga la validación de los VOs (día y duración)', () => {
    expect(() => FranjaHoraria.crear(6, '07:00', '08:30', 1)).toThrow(
      ValidationError,
    );
    expect(() => FranjaHoraria.crear(1, '07:00', '09:00', 1)).toThrow(
      ValidationError,
    );
  });

  it('rechaza orden fuera de [1,8]', () => {
    expect(() => FranjaHoraria.crear(1, '07:00', '08:30', 0)).toThrow(
      ValidationError,
    );
    expect(() => FranjaHoraria.crear(1, '07:00', '08:30', 9)).toThrow(
      ValidationError,
    );
  });

  it('rehidrata desde primitivos sin perder los invariantes', () => {
    const franja = FranjaHoraria.reconstituir({
      id: 'abc',
      diaSemana: 5,
      horaInicio: '17:30',
      horaFin: '19:00',
      orden: 8,
      activa: true,
      creadoEn: new Date(),
    });
    expect(franja.id).toBe('abc');
    expect(franja.diaSemana).toBe(5);
    expect(franja.horaFin).toBe('19:00');
  });
});

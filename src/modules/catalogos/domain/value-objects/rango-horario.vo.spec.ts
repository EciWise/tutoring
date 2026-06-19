import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { RangoHorario } from './rango-horario.vo';

describe('RangoHorario (Value Object)', () => {
  it('acepta un bloque de 90 minutos exactos', () => {
    const rango = RangoHorario.crear('07:00', '08:30');
    expect(rango.horaInicio).toBe('07:00');
    expect(rango.horaFin).toBe('08:30');
  });

  it('acepta el último bloque del día (17:30–19:00)', () => {
    const rango = RangoHorario.crear('17:30', '19:00');
    expect(rango.horaFin).toBe('19:00');
  });

  it('rechaza duraciones distintas de 90 minutos', () => {
    expect(() => RangoHorario.crear('07:00', '08:29')).toThrow(ValidationError);
    expect(() => RangoHorario.crear('07:00', '08:31')).toThrow(ValidationError);
    expect(() => RangoHorario.crear('07:00', '07:00')).toThrow(ValidationError);
  });

  it('rechaza rangos invertidos (fin antes de inicio)', () => {
    expect(() => RangoHorario.crear('08:30', '07:00')).toThrow(ValidationError);
  });

  it('rechaza formatos de hora inválidos', () => {
    expect(() => RangoHorario.crear('7:00', '08:30')).toThrow(ValidationError);
    expect(() => RangoHorario.crear('25:00', '26:30')).toThrow(ValidationError);
    expect(() => RangoHorario.crear('ab:cd', 'ef:gh')).toThrow(ValidationError);
  });

  it('es igual por valor, no por identidad', () => {
    expect(
      RangoHorario.crear('07:00', '08:30').equals(
        RangoHorario.crear('07:00', '08:30'),
      ),
    ).toBe(true);
    expect(
      RangoHorario.crear('07:00', '08:30').equals(
        RangoHorario.crear('08:30', '10:00'),
      ),
    ).toBe(false);
  });
});

import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { DiaSemana } from './dia-semana.vo';

describe('DiaSemana (Value Object)', () => {
  it('acepta los extremos válidos L-V [1,5]', () => {
    expect(DiaSemana.crear(1).valor).toBe(1);
    expect(DiaSemana.crear(5).valor).toBe(5);
  });

  it('rechaza el domingo/sábado y valores fuera de rango', () => {
    expect(() => DiaSemana.crear(0)).toThrow(ValidationError);
    expect(() => DiaSemana.crear(6)).toThrow(ValidationError);
    expect(() => DiaSemana.crear(7)).toThrow(ValidationError);
  });

  it('rechaza valores no enteros', () => {
    expect(() => DiaSemana.crear(2.5)).toThrow(ValidationError);
  });

  it('es igual por valor, no por identidad', () => {
    expect(DiaSemana.crear(3).equals(DiaSemana.crear(3))).toBe(true);
    expect(DiaSemana.crear(3).equals(DiaSemana.crear(4))).toBe(false);
  });
});

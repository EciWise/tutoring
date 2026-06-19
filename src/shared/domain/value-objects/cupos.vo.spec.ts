import { ValidationError } from '../errors/domain-error';
import { Cupos } from './cupos.vo';

describe('Cupos (Value Object)', () => {
  it('crea con ocupados=0 por defecto', () => {
    const cupos = Cupos.crear(5);
    expect(cupos.maximos).toBe(5);
    expect(cupos.ocupados).toBe(0);
    expect(cupos.hayCupo()).toBe(true);
  });

  it('detecta cupo lleno', () => {
    expect(Cupos.crear(3, 3).hayCupo()).toBe(false);
    expect(Cupos.crear(3, 2).hayCupo()).toBe(true);
  });

  it('rechaza máximos < 1 o no enteros', () => {
    expect(() => Cupos.crear(0)).toThrow(ValidationError);
    expect(() => Cupos.crear(-2)).toThrow(ValidationError);
    expect(() => Cupos.crear(2.5)).toThrow(ValidationError);
  });

  it('rechaza ocupados fuera de [0, maximos]', () => {
    expect(() => Cupos.crear(3, -1)).toThrow(ValidationError);
    expect(() => Cupos.crear(3, 4)).toThrow(ValidationError);
  });
});

import { ValidationError } from '../errors/domain-error';
import { Calificacion } from './calificacion.vo';

describe('Calificacion (Value Object)', () => {
  it('acepta los extremos válidos del rango [1,5]', () => {
    expect(Calificacion.crear(1).valor).toBe(1);
    expect(Calificacion.crear(5).valor).toBe(5);
  });

  it('rechaza valores por debajo del mínimo', () => {
    expect(() => Calificacion.crear(0)).toThrow(ValidationError);
  });

  it('rechaza valores por encima del máximo', () => {
    expect(() => Calificacion.crear(6)).toThrow(ValidationError);
  });

  it('rechaza valores no enteros', () => {
    expect(() => Calificacion.crear(3.5)).toThrow(ValidationError);
  });

  it('es igual por valor, no por identidad', () => {
    expect(Calificacion.crear(4).equals(Calificacion.crear(4))).toBe(true);
    expect(Calificacion.crear(4).equals(Calificacion.crear(2))).toBe(false);
  });

  it('es inmutable (props congeladas)', () => {
    const calificacion = Calificacion.crear(3);
    expect(() => {
      (calificacion as unknown as { props: { valor: number } }).props.valor = 9;
    }).toThrow();
  });
});

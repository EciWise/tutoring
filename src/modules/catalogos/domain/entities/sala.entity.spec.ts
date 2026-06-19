import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Sala } from './sala.entity';

describe('Sala (entidad)', () => {
  it('se crea activa; edificio y capacidad son opcionales', () => {
    const sala = Sala.crear('B-201');
    expect(sala.codigo).toBe('B-201');
    expect(sala.edificio).toBeNull();
    expect(sala.capacidad).toBeNull();
    expect(sala.activa).toBe(true);
  });

  it('acepta edificio y capacidad válidos', () => {
    const sala = Sala.crear('B-201', 'Bloque B', 30);
    expect(sala.edificio).toBe('Bloque B');
    expect(sala.capacidad).toBe(30);
  });

  it('rechaza código vacío', () => {
    expect(() => Sala.crear('  ')).toThrow(ValidationError);
  });

  it('rechaza capacidad no positiva o no entera', () => {
    expect(() => Sala.crear('B-201', null, 0)).toThrow(ValidationError);
    expect(() => Sala.crear('B-201', null, -5)).toThrow(ValidationError);
    expect(() => Sala.crear('B-201', null, 2.5)).toThrow(ValidationError);
  });
});

import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Sala } from './sala.entity';

describe('Sala (entidad)', () => {
  it('se crea activa; el edificio es opcional', () => {
    const sala = Sala.crear('B-201');
    expect(sala.codigo).toBe('B-201');
    expect(sala.edificio).toBeNull();
    expect(sala.activa).toBe(true);
  });

  it('acepta un edificio válido', () => {
    const sala = Sala.crear('B-201', 'Bloque B');
    expect(sala.edificio).toBe('Bloque B');
  });

  it('rechaza código vacío', () => {
    expect(() => Sala.crear('  ')).toThrow(ValidationError);
  });
});

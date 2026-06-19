import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Materia } from './materia.entity';

describe('Materia (entidad)', () => {
  it('se crea activa con id generado y campos saneados', () => {
    const materia = Materia.crear('  MATD1101 ', '  Cálculo Diferencial ');
    expect(materia.id).toMatch(/[0-9a-f-]{36}/);
    expect(materia.codigo).toBe('MATD1101');
    expect(materia.nombre).toBe('Cálculo Diferencial');
    expect(materia.activa).toBe(true);
  });

  it('alterna su estado vía activar/desactivar', () => {
    const materia = Materia.crear('FISI', 'Física');
    materia.desactivar();
    expect(materia.activa).toBe(false);
    materia.activar();
    expect(materia.activa).toBe(true);
  });

  it('rechaza código vacío o demasiado largo', () => {
    expect(() => Materia.crear('   ', 'Física')).toThrow(ValidationError);
    expect(() => Materia.crear('X'.repeat(21), 'Física')).toThrow(
      ValidationError,
    );
  });

  it('rechaza nombre vacío o demasiado largo', () => {
    expect(() => Materia.crear('FISI', '  ')).toThrow(ValidationError);
    expect(() => Materia.crear('FISI', 'N'.repeat(151))).toThrow(
      ValidationError,
    );
  });
});

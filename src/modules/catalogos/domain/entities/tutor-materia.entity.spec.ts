import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { TutorMateria } from './tutor-materia.entity';

describe('TutorMateria (entidad)', () => {
  it('se crea autorizada por defecto', () => {
    const tm = TutorMateria.crear('mat-1', 'tutor-1');
    expect(tm.materiaId).toBe('mat-1');
    expect(tm.tutorUserId).toBe('tutor-1');
    expect(tm.autorizada).toBe(true);
  });

  it('permite crearla no autorizada', () => {
    expect(TutorMateria.crear('mat-1', 'tutor-1', false).autorizada).toBe(
      false,
    );
  });

  it('alterna la autorización', () => {
    const tm = TutorMateria.crear('mat-1', 'tutor-1');
    tm.desautorizar();
    expect(tm.autorizada).toBe(false);
    tm.autorizar();
    expect(tm.autorizada).toBe(true);
  });

  it('exige materiaId y tutorUserId', () => {
    expect(() => TutorMateria.crear('  ', 'tutor-1')).toThrow(ValidationError);
    expect(() => TutorMateria.crear('mat-1', '  ')).toThrow(ValidationError);
  });
});

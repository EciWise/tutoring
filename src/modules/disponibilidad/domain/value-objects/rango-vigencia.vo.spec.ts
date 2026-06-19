import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { RangoVigencia } from './rango-vigencia.vo';

describe('RangoVigencia (Value Object)', () => {
  it('acepta hasta >= desde y normaliza a fecha', () => {
    const r = RangoVigencia.crear(
      new Date('2026-06-01'),
      new Date('2026-12-31'),
    );
    expect(r.desde.toISOString().slice(0, 10)).toBe('2026-06-01');
    expect(r.hasta.toISOString().slice(0, 10)).toBe('2026-12-31');
  });

  it('acepta un rango de un solo día', () => {
    const d = new Date('2026-06-10');
    expect(() => RangoVigencia.crear(d, d)).not.toThrow();
  });

  it('rechaza hasta < desde', () => {
    expect(() =>
      RangoVigencia.crear(new Date('2026-06-10'), new Date('2026-06-09')),
    ).toThrow(ValidationError);
  });

  it('contiene fechas dentro del rango (inclusive) y excluye las de fuera', () => {
    const r = RangoVigencia.crear(
      new Date('2026-06-01'),
      new Date('2026-06-30'),
    );
    expect(r.contiene(new Date('2026-06-01'))).toBe(true);
    expect(r.contiene(new Date('2026-06-30'))).toBe(true);
    expect(r.contiene(new Date('2026-06-15'))).toBe(true);
    expect(r.contiene(new Date('2026-05-31'))).toBe(false);
    expect(r.contiene(new Date('2026-07-01'))).toBe(false);
  });
});

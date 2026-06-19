import { isoDow } from './fecha.util';
import { calcularFechasMaterializables } from './franja-materializacion';
import { RangoVigencia } from './value-objects/rango-vigencia.vo';

describe('calcularFechasMaterializables', () => {
  const vigenciaJunio = RangoVigencia.crear(
    new Date('2026-06-01'),
    new Date('2026-06-30'),
  );

  it('devuelve solo fechas del día indicado, dentro de ventana y vigencia, espaciadas 7 días', () => {
    const dia = 1; // lunes
    const fechas = calcularFechasMaterializables(
      dia,
      vigenciaJunio,
      new Date('2026-06-01'),
      new Date('2026-06-30'),
    );
    expect(fechas.length).toBeGreaterThan(0);
    for (const f of fechas) {
      expect(isoDow(f)).toBe(dia);
      expect(vigenciaJunio.contiene(f)).toBe(true);
    }
    for (let i = 1; i < fechas.length; i++) {
      const diffDias =
        (fechas[i].getTime() - fechas[i - 1].getTime()) / 86_400_000;
      expect(diffDias).toBe(7);
    }
  });

  it('recorta a la vigencia aunque la ventana sea mayor', () => {
    const vigencia = RangoVigencia.crear(
      new Date('2026-06-08'),
      new Date('2026-06-14'),
    ); // una sola semana
    const fechas = calcularFechasMaterializables(
      3, // miércoles
      vigencia,
      new Date('2026-06-01'),
      new Date('2026-06-30'),
    );
    expect(fechas).toHaveLength(1);
    expect(fechas[0].toISOString().slice(0, 10)).toBe('2026-06-10');
  });

  it('devuelve vacío si ningún día de la ventana cae en la vigencia', () => {
    const vigencia = RangoVigencia.crear(
      new Date('2026-07-01'),
      new Date('2026-07-31'),
    );
    expect(
      calcularFechasMaterializables(
        1,
        vigencia,
        new Date('2026-06-01'),
        new Date('2026-06-30'),
      ),
    ).toHaveLength(0);
  });
});

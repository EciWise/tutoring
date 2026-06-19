import { construirGrillaFranjas } from './franja-grilla';
import { FranjaHoraria } from './entities/franja-horaria.entity';

describe('construirGrillaFranjas', () => {
  const grilla = construirGrillaFranjas();

  it('genera 40 franjas (5 días × 8 bloques)', () => {
    expect(grilla).toHaveLength(40);
  });

  it('el primer bloque del lunes es 07:00–08:30 (orden 1)', () => {
    expect(grilla[0]).toEqual({
      diaSemana: 1,
      horaInicio: '07:00',
      horaFin: '08:30',
      orden: 1,
    });
  });

  it('el último bloque del viernes es 17:30–19:00 (orden 8)', () => {
    expect(grilla[grilla.length - 1]).toEqual({
      diaSemana: 5,
      horaInicio: '17:30',
      horaFin: '19:00',
      orden: 8,
    });
  });

  it('cada item de la grilla es una FranjaHoraria de dominio válida', () => {
    // Si la grilla violara día (1-5), 90 min u orden (1-8), esto lanzaría.
    expect(() =>
      grilla.map((f) =>
        FranjaHoraria.crear(f.diaSemana, f.horaInicio, f.horaFin, f.orden),
      ),
    ).not.toThrow();
  });
});

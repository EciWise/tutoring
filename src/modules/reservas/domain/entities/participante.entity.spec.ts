import { EstadoAsistencia } from '../../../../shared/domain/enums/estado-asistencia.enum';
import { ValidationError } from '../../../../shared/domain/errors/domain-error';
import { Participante } from './participante.entity';

describe('Participante (entidad)', () => {
  it('se reserva en estado CONFIRMADA con tema y dudas saneados', () => {
    const p = Participante.reservar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
      temaEspecifico: '  Punteros  ',
      descripcionDudas: '  no entiendo malloc  ',
    });
    expect(p.estadoAsistencia).toBe(EstadoAsistencia.CONFIRMADA);
    expect(p.temaEspecifico).toBe('Punteros');
    expect(p.descripcionDudas).toBe('no entiendo malloc');
    expect(p.canceladoEn).toBeNull();
  });

  it('tema/dudas vacíos quedan en null', () => {
    const p = Participante.reservar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
    });
    expect(p.temaEspecifico).toBeNull();
    expect(p.descripcionDudas).toBeNull();
  });

  it('cancelar exige motivo y marca CANCELADA con fecha y motivo', () => {
    const p = Participante.reservar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
    });
    p.cancelar('  cruce de horario  ');
    expect(p.estadoAsistencia).toBe(EstadoAsistencia.CANCELADA);
    expect(p.motivoCancelacion).toBe('cruce de horario');
    expect(p.canceladoEn).toBeInstanceOf(Date);
  });

  it('cancelar sin motivo lanza ValidationError (RN-08)', () => {
    const p = Participante.reservar({
      tutoriaId: 't1',
      estudianteUserId: 'e1',
    });
    expect(() => p.cancelar('   ')).toThrow(ValidationError);
  });
});

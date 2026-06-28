import { Modalidad } from '../../../../shared/domain/enums/modalidad.enum';
import {
  IUsuarioDirectoryPort,
  UsuarioLocalView,
} from '../../../identidad/domain/ports/outbound/usuario-directory.port';
import {
  ITutoriaQueryPort,
  TutoriaDetalle,
  TutoriaResumen,
} from '../../domain/ports/outbound/tutoria-query.port';
import { BuscarTutoriasUseCase } from './buscar-tutorias.use-case';

const RESUMEN: TutoriaResumen = {
  id: 't1',
  tutorUserId: 'tutor-1',
  fecha: new Date('2026-06-22'),
  diaSemana: 1,
  horaInicio: '07:00',
  horaFin: '08:30',
  materiaId: 'm1',
  materiaCodigo: 'FISI',
  materiaNombre: 'Física',
  modalidad: Modalidad.VIRTUAL,
  salaCodigo: null,
  enlaceVirtual: null,
  cuposMaximos: 4,
  cuposDisponibles: 4,
};

class FakeQuery implements ITutoriaQueryPort {
  buscar(): Promise<TutoriaResumen[]> {
    return Promise.resolve([RESUMEN]);
  }
  obtenerDetalle(): Promise<TutoriaDetalle | null> {
    return Promise.resolve(null);
  }
}

class FakeDirectory implements IUsuarioDirectoryPort {
  getById(): Promise<UsuarioLocalView | null> {
    return Promise.resolve(null);
  }
  getMany(): Promise<UsuarioLocalView[]> {
    return Promise.resolve([
      {
        userId: 'tutor-1',
        nombre: 'Ada',
        apellido: 'Lovelace',
        email: null,
        rol: 'tutor' as UsuarioLocalView['rol'],
      },
    ]);
  }
  upsertFromJwt(): Promise<void> {
    return Promise.resolve();
  }
}

describe('BuscarTutoriasUseCase', () => {
  it('enriquece cada slot con el nombre del tutor', async () => {
    const useCase = new BuscarTutoriasUseCase(
      new FakeQuery(),
      new FakeDirectory(),
    );
    const [slot] = await useCase.ejecutar({});
    expect(slot.id).toBe('t1');
    expect(slot.tutorNombre).toBe('Ada Lovelace');
  });
});
